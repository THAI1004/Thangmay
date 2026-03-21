import {Injectable} from '@nestjs/common'
import {CreateStaffDto} from './dto/create-staff.dto'
import {UpdateStaffDto} from './dto/update-staff.dto'
import {Staff} from './entities/staff.entity'
import {Repository} from 'typeorm'
import {InjectRepository} from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import {LoginDto} from './dto/create-staff-logindto'
import {JwtService} from '@nestjs/jwt'
import {relative} from 'path'
import {NotificationService} from 'src/notification/notification.service'
import {SendMailService} from '../send-mail/send-mail.service'
import {MailerService} from '@nestjs-modules/mailer'
@Injectable()
export class StaffsService {
  constructor (
    @InjectRepository(Staff)
    private staffsRepository: Repository<Staff>,
    private jwtService: JwtService,
    private sendMailService: SendMailService,
    private mailerService: MailerService,
  ) {}

  findNhanTBBaoTri () {
    return this.staffsRepository.find({
      where: {
        role_admin: false,
        status: true,
        department: {id: 2},
      },
      relations: ['department', 'position'],
    })
  }

  findPayrollWStaff (staffId: number) {
    return this.staffsRepository.findOne({
      where: {
        id: staffId,
      },
      relations: [
        'projectSteps',
        'projectSteps.workflowStep.step',
        'projectSteps.project',
        'maintenanceActions',
        'maintenanceActions.maintenance',
        'maintenanceActions.maintenance.project',
      ],
    })
  }
  async create (createStaffDto: CreateStaffDto, password: string): Promise<Staff> {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const createStaffDtohash = this.staffsRepository.create({
      ...createStaffDto,
      password: hashedPassword,
    })
    return this.staffsRepository.save(createStaffDtohash)
  }

  async findAll () {
    return this.staffsRepository.find({
      order: {
        status: 'DESC',
      },
      relations: ['department', 'position'],
    })
  }

  async findStaffsByDepartment (departmentId: number) {
    return this.staffsRepository.find({
      where: {
        department: {id: departmentId},
        role_admin: false,
      },
      relations: ['department', 'position'],
    })
  }

  async findAllPayroll () {
    const staffs = await this.staffsRepository.find({
      order: {status: 'DESC'},
      relations: ['projectSteps', 'maintenanceActions'],
    })
    const results = staffs.map((staff) => {
      // Tính số lượng ongoingTasks
      const ongoingTasks =
        staff.projectSteps.filter((step) => step.status == null).length +
        staff.maintenanceActions.filter((action) => action.status == null).length
      // Tính số lượng completedTasks
      const completedTasks =
        staff.projectSteps.filter((step) => step.status !== null).length +
        staff.maintenanceActions.filter((action) => action.status !== null).length
      // Tổng số task
      const totalTasks = ongoingTasks + completedTasks

      return {
        staff,
        ongoingTasks,
        completedTasks,
        totalTasks,
      }
    })
    return results
  }
  async findAllPayrollByDepartment (idDepartment: number) {
    const staffs = await this.staffsRepository.find({
      where: {department: {id: idDepartment}},
      order: {status: 'DESC'},
      relations: ['projectSteps', 'maintenanceActions'],
    })
    const results = staffs.map((staff) => {
      // Tính số lượng ongoingTasks
      const ongoingTasks =
        staff.projectSteps.filter((step) => step.status == null).length +
        staff.maintenanceActions.filter((action) => action.status == null).length
      // Tính số lượng completedTasks
      const completedTasks =
        staff.projectSteps.filter((step) => step.status !== null).length +
        staff.maintenanceActions.filter((action) => action.status !== null).length
      // Tổng số task
      const totalTasks = ongoingTasks + completedTasks
      return {
        staff,
        ongoingTasks,
        completedTasks,
        totalTasks,
      }
    })

    return results
  }

  findOne (id: number) {
    return this.staffsRepository.findOne({
      where: {id},
      relations: ['department', 'position', 'permisions'],
    })
  }
  findOnew (email: string) {
    return this.staffsRepository.findOne({where: {email}})
  }
  async login (loginDto: LoginDto) {
    const emailStr = loginDto.email ? loginDto.email.trim() : loginDto.email;
    console.log('[DEBUG] Trying to login with email:', emailStr);
    const staff = await this.staffsRepository.findOne({
      where: {email: emailStr}, // Removed status strict check to see if it exists
      relations: ['department', 'position'],
    })
    console.log('[DEBUG] Staff found:', staff ? `Yes, status: ${staff.status}` : 'No');
    if (!staff) {
      return false
    }
    if (!staff.status) {
      console.log('[DEBUG] Staff exists but status is false');
      return false;
    }
    
    // Trim password to handle leading/trailing spaces when copied from email
    const trimmedPassword = loginDto.password ? loginDto.password.trim() : loginDto.password;
    console.log('[DEBUG] Password valid check - Original input length:', loginDto.password?.length, 'Trimmed length:', trimmedPassword?.length);
    
    const isPasswordValid = await bcrypt.compare(trimmedPassword, staff.password)
    console.log('[DEBUG] Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return false
    }
    const payload = {
      email: staff.email,
      id: staff.id,
      role_admin: staff.role_admin,
      full_name: staff.full_name,
      avatar: staff.avatar,
      manager: staff.position.id === 1,
      busines: staff.department.id === 1,
    }
    const token = this.createToken(payload)
    return token
  }
  async createToken (payload: any) {
    const token = this.jwtService.sign(payload)
    return token
  }
  async payload (token: string) {
    const payload = await this.jwtService.verify(token)
    return payload
  }
  async update (id: number, updateStaffDto: UpdateStaffDto) {
    if (updateStaffDto.password) {
      const saltRounds = 10
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, saltRounds)
    }
    await this.staffsRepository.update(id, updateStaffDto)
  }
  remove (id: number) {
    return this.staffsRepository.softDelete(id)
  }
  async changeStatus (id: number) {
    const staff = await this.staffsRepository.findOne({where: {id}})
    if (staff) {
      const newStatus = !staff.status
      await this.staffsRepository.update(id, {status: newStatus})
    }
  }
  async checkStatus (id: number) {
    const staff = await this.staffsRepository.findOne({where: {id, status: true}})
    return staff
  }
  async findAllBusines () {
    const currentYear = new Date().getFullYear()
    const staffs = await this.staffsRepository.find({
      where: {department: {id: 1}},
      relations: ['projectStaff', 'targetBusine', 'department'],
    })
    const result = staffs.map((staff) => {
      const currentYearTargets = staff.targetBusine
        ? staff.targetBusine.filter((target) => target.year === currentYear)
        : []
      const totalTarget = currentYearTargets.reduce((sum, target) => sum + (target.target || 0), 0)
      return {
        ...staff,
        totalProjectStaff: staff.projectStaff ? staff.projectStaff.length : 0,
        totalTarget,
      }
    })
    return result
  }
  async forgotPassword (email: string) {
    const staff = await this.staffsRepository.findOne({
      where: {
        email,
      },
    })
    if (staff) {
      const kyTu = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let passwordNew = ''
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * kyTu.length)
        passwordNew += kyTu[randomIndex]
      }
      const saltRounds = 10
      const passwordNewHash = await bcrypt.hash(passwordNew, saltRounds)
      await this.staffsRepository.update(+staff.id, {password: passwordNewHash})
      const nameStaff = staff.full_name
      const contentSendMail = await this.sendMailService.notificationForgotPassword(nameStaff, email, passwordNew)
      this.mailerService
        .sendMail(contentSendMail)
        .then(() => {})
        .catch((error) => {
          return {message: 'Gửi mail thất bại!', error: error.message}
        })
      return true
    } else {
      return false
    }
  }
}
