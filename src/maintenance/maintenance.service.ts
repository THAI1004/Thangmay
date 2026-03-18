import {Injectable} from '@nestjs/common'
import {CreateMaintenanceDto} from './dto/create-maintenance.dto'
import {InjectRepository} from '@nestjs/typeorm'
import {Maintenance} from './entities/maintenance.entity'
import {Between, LessThan, Like, MoreThan, Repository} from 'typeorm'
import {CreateMaintenanceActionDto} from 'src/maintenance_actions/dto/create-maintenance_action.dto'
import {MaintenanceAction} from 'src/maintenance_actions/entities/maintenance_action.entity'
@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(MaintenanceAction)
    private readonly maintenanceActionRepository: Repository<MaintenanceAction>,
  ) {}



  async findByNotifycation() {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const twoDaysLater = new Date(currentDate)
    twoDaysLater.setDate(currentDate.getDate() + 2)
    return this.maintenanceRepository.find({
      relations: ['project'],
      where: {
        // confirmSuccess: true,
        time: Between(currentDate, twoDaysLater),
      },
      order: {time: 'ASC'},
    })
  }

  async create3(createMaintenanceActionDto: CreateMaintenanceActionDto) {
    return this.maintenanceActionRepository.save({
      ...createMaintenanceActionDto,
      // confirmSuccess: false
    })
  }
  create2(createMaintenanceDto: CreateMaintenanceDto, confirmSuccess: boolean) {
    return this.maintenanceRepository.save({
      ...createMaintenanceDto,
      // confirmSuccess: confirmSuccess
    })
  }
  create(createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceRepository.save(createMaintenanceDto)
  }
  async findAllMaintenanceComing() {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const threeDaysLater = new Date(currentDate)
    threeDaysLater.setDate(currentDate.getDate() + 3)
    return this.maintenanceRepository.find({
      relations: ['project'],
      where: {
        // confirmSuccess: true,
        time: Between(currentDate, threeDaysLater),
      },
      order: {time: 'ASC'},
    })
  }
  async findAllMaintenanceComingByBusines(idStaff: number) {
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const threeDaysLater = new Date(currentDate)
    threeDaysLater.setDate(currentDate.getDate() + 3)
    return this.maintenanceRepository.find({
      relations: ['project', 'project.projectStaff', 'project.projectStaff.staff'],
      where: {
        // confirmSuccess: true,
        time: Between(currentDate, threeDaysLater),
        project: {
          projectStaff: {
            staff: {id: idStaff},
          },
        },
      },
      order: {time: 'ASC'},
    })
  }
  findAll() {
    return this.maintenanceRepository.find({
      relations: ['project', 'maintenanceActions', 'maintenanceActions.staff'],
      where: {
        // confirmSuccess: true
      },
      order: {
        time: 'ASC',
      },
    })
  }
  findAllByBusiness(idStaff: number) {
    console.log(idStaff)
    return this.maintenanceRepository.find({
      relations: ['project', 'project.projectStaff', 'maintenanceActions', 'maintenanceActions.staff'],
      where: {
        // confirmSuccess: true,
        project: {
          projectStaff: {
            staff: {id: idStaff},
          },
        },
      },
      order: {
        time: 'ASC',
      },
    })
  }
  async maintenanceYc() {
    return this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.project', 'project')
      .leftJoinAndSelect('maintenance.maintenanceActions', 'maintenanceActions')
      .andWhere('maintenanceActions.status IS NULL')
      .orderBy('maintenance.time', 'ASC')
      .getMany()
  }
  async maintenanceYcByBusines(idStaff: number) {
    return this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.project', 'project')
      .leftJoinAndSelect('project.projectStaff', 'projectStaff')
      .leftJoinAndSelect('projectStaff.staff', 'staff')
      .leftJoinAndSelect('maintenance.maintenanceActions', 'maintenanceActions')

      .andWhere('maintenanceActions.status IS NULL')
      .andWhere('staff.id = :staffId', {staffId: idStaff})
      .orderBy('maintenance.time', 'ASC')
      .getMany()
  }

  async maintenanceYcHtByBusines(idStaff: number) {
    return (
      this.maintenanceRepository
        .createQueryBuilder('maintenance')
        .leftJoinAndSelect('maintenance.project', 'project')
        .leftJoinAndSelect('project.projectStaff', 'projectStaff')
        .leftJoinAndSelect('projectStaff.staff', 'staff')
        .leftJoinAndSelect('maintenance.maintenanceActions', 'maintenanceActions')
        // .where('maintenance.confirmSuccess = :confirmSuccess', {
        //   confirmSuccess: false
        // })
        .andWhere('maintenanceActions.status IS NOT NULL')
        .andWhere('staff.id = :staffId', {staffId: idStaff})
        .orderBy('maintenance.time', 'ASC')
        .getMany()
    )
  }

  async maintenanceYcHt() {
    return (
      this.maintenanceRepository
        .createQueryBuilder('maintenance')
        .leftJoinAndSelect('maintenance.project', 'project')
        .leftJoinAndSelect('maintenance.maintenanceActions', 'maintenanceActions')
        // .where('maintenance.confirmSuccess = :confirmSuccess', {
        //   confirmSuccess: false
        // })
        .andWhere('maintenanceActions.status IS NOT NULL')
        .orderBy('maintenance.time', 'ASC')
        .getMany()
    )
  }
  findAllWProject(idProject: number) {
    return this.maintenanceRepository.find({
      relations: ['project', 'maintenanceActions', 'maintenanceActions.staff'],
      where: {
        // confirmSuccess: true,
        project: {
          id: idProject,
        },
      },
      order: {
        time: 'ASC',
      },
    })
  }
  findOne(id: number) {
    return this.maintenanceRepository.findOne({
      relations: ['project', 'maintenanceActions'],
      where: {
        // confirmSuccess: true,
        id: id,
      },
    })
  }
  // updateConfirmSuccess (id: number) {
  //   return this.maintenanceRepository.update(id, { confirmSuccess: true })
  // }
  // updateConfirmNoSuccess (id: number) {
  //   return this.maintenanceRepository.update(id, { confirmSuccess: false })
  // }
  ConfirmDelete(id: number) {
    return this.maintenanceRepository.delete(id)
  }

  async updateActualDate(id: number, actualDate: string | null) {
    return this.maintenanceRepository.update(id, { actualDate: actualDate as any })
  }
}
