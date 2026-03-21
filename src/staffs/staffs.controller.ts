import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
  UploadedFile,
  UseInterceptors,
  Res,
  Req,
  SetMetadata,
  Redirect,
} from '@nestjs/common'
import {Request, Response} from 'express'
import {StaffsService} from './staffs.service'
import {CreateStaffDto} from './dto/create-staff.dto'
import {UpdateStaffDto} from './dto/update-staff.dto'
import {PositionsService} from 'src/positions/positions.service'
import {DepartmensService} from 'src/departmens/departmens.service'
import {FileInterceptor} from '@nestjs/platform-express'
import {diskStorage} from 'multer'
import {extname} from 'path'
import {SendMailService} from 'src/send-mail/send-mail.service'
import {MailerService} from '@nestjs-modules/mailer'
import {ProjectStepsService} from 'src/project_steps/project_steps.service'
import * as bcrypt from 'bcrypt'
import {Permision} from '../permision/entities/permision.entity'
import {PermisionService} from 'src/permision/permision.service'
@Controller('staffs')
export class StaffsController {
  constructor (
    private readonly staffsService: StaffsService,
    private readonly positionsService: PositionsService,
    private readonly departmensService: DepartmensService,
    private readonly sendMailService: SendMailService,
    private mailerService: MailerService,
    private projectStepsService: ProjectStepsService,
    private permisionService: PermisionService,
  ) {}
  @SetMetadata('permision', 'MANAGE_SALES_STAFF')
  @Get('busines')
  @Render('admin/staff/busines')
  async findBusinesList () {
    const staffsBusiness = await this.staffsService.findAllBusines()
    return {staffsBusiness, activeMenu: 'staffs/busines'}
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Get('/add')
  @Render('admin/staff/add')
  async renderAdd () {
    const positions = await this.positionsService.findAll()
    const departmens = await this.departmensService.findAll()
    const staffs = await this.staffsService.findAll()
    const staffEmailOld = staffs.map((staff) => staff.email)
    const staffPhoneOld = staffs.map((staff) => staff.number_phone)
    return {
      positions,
      departmens,
      staffEmailOld,
      staffPhoneOld,
      activeMenu: 'staffs/add',
    }
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Post('/add')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/images/avatar',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + extname(file.originalname)
          callback(null, file.fieldname + '-' + uniqueSuffix)
        },
      }),
    }),
  )
  @SetMetadata('permision', 'MANAGE_STAFF')
  async postAdd (
    @UploadedFile() file: Express.Multer.File,
    @Body() createStaffDto: CreateStaffDto,
    @Res() res: Response,
  ) {
    if (file) {
      createStaffDto.avatar = file.filename
    }else{
      createStaffDto.avatar = 'default-avatar.png'
    }
    const kyTu = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%'
    let matKhau = ''
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * kyTu.length)
      matKhau += kyTu[randomIndex]
    }
    await this.staffsService.create(createStaffDto, matKhau)
    const contentSendMail = await this.sendMailService.notificationCreateStaff(
      matKhau,
      createStaffDto.full_name,
      createStaffDto.email,
      'Thông báo tạo tài khoản !!!',
      '<p>Chúng tôi muốn thông báo rằng email của bạn vừa được đang ký tài khoản tại <strong>Thang Máy Tesla</strong>.</p>',
    )
    this.mailerService
      .sendMail(contentSendMail)
      .then(() => {})
      .catch((error) => {
        return {message: 'Gửi mail thất bại!', error: error.message}
      })
    return res.redirect('/staffs')
  }
  @Get('changePass')
  @Render('admin/staff/changePass')
  async changePass () {
    return {activeMenu: 'staffs/changePass'}
  }
  @Patch('changePass')
  async changePassPatch (
    @Res() res: Response,
    @Req() req: Request,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('admin/staff/changePass', {
        message: 'Vui lòng nhập đầy đủ thông tin!',
        status: 'error',
      })
    }
    if (currentPassword === newPassword) {
      return res.render('admin/staff/changePass', {
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!',
        status: 'error',
      })
    }
    const token = req.cookies['token']
    if (token) {
      const payload = await this.staffsService.payload(token)
      const Staff = await this.staffsService.findOne(payload.id)
      const isPasswordValid = await bcrypt.compare(currentPassword, Staff.password)
      if (isPasswordValid) {
        if (newPassword === confirmPassword) {
          await this.staffsService.update(payload.id, {
            password: newPassword,
          })
          res.render('login', {
            message: 'Đổi mật khẩu thành công vui lòng đang nhập lại !',
            status: 'success',
          })
          return res.clearCookie('token')
        } else {
          return res.render('admin/staff/changePass', {
            message: 'Mật khẩu mới và mật khẩu xác nhận không khớp!',
            status: 'error',
          })
        }
      } else {
        return res.render('admin/staff/changePass', {
          message: 'Mật khẩu cũ không chính xác !',
          status: 'error',
        })
      }
    }
    return {}
  }
  @SetMetadata('permision', 'MANAGE_SALES_STAFF')
  @Get('payroll')
  @Render('admin/staff/payroll')
  async findAllPayroll (@Req() req: Request) {
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let staffs = null
    if (inforAccount.role_admin) {
      staffs = await this.staffsService.findAllPayroll()
    } else {
      staffs = await this.staffsService.findAllPayrollByDepartment(inforAccount.department.id)
    }
    return {
      staffs,
      activeMenu:"staffs/payroll",
    }
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Get()
  @Render('admin/staff/staff')
  async findAll (@Req() req: Request) {
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let staffs = null
    if (inforAccount.role_admin) {
      staffs = await this.staffsService.findAll()
    } else {
      staffs = await this.staffsService.findStaffsByDepartment(inforAccount.department.id)
    }
    return {
      staffs,
      activeMenu: 'staffs',
    }
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Get(':id')
  findOne (@Param('id') id: string) {
    return this.staffsService.findOne(+id)
  }
  @Get('/payroll/:id')
  @Render('admin/staff/payroll_detail')
  async findPayrollDetail (@Param('id') id: string) {
    const infoStaffs = await this.staffsService.findPayrollWStaff(+id)
    const Staff = await this.staffsService.findOne(+id)
    const permisionPhanQuyen = await this.permisionService.findPhanqQuyen(+id)
    const permision = await this.permisionService.findAll()
    return {
      Staff,
      infoStaffs,
      permision,
      permisionPhanQuyen,
      activeMenu:"staffs/payroll",
    }
  }

  @SetMetadata('permision', 'MANAGE_SALES_STAFF')
  @Post('/payroll/:id')
  @Redirect('back')
  async phaQuyen (@Param('id') id: string, @Body('quyen') quyen: any) {
    await this.permisionService.udpatePhanQuyen(+id) 
    await this.permisionService.createQuyen(+id, quyen) 
    return {}
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Patch(':id')
  update (@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffsService.update(+id, updateStaffDto)
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Patch('changeStatus/:id')
  async changeStatus (@Param('id') id: string) {
    return await this.staffsService.changeStatus(+id)
  }
  @SetMetadata('permision', 'MANAGE_STAFF')
  @Delete()
  remove (@Body('id') id: string) {
    return this.staffsService.remove(+id)
  }
}
