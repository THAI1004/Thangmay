import {Injectable} from '@nestjs/common'
import {CreateHistoryMaintenanceDto} from './dto/create-history-maintenance.dto'
import {UpdateHistoryMaintenanceDto} from './dto/update-history-maintenance.dto'
import {HistoryMaintenance} from './entities/history-maintenance.entity'
import {LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository} from 'typeorm'
import {InjectRepository} from '@nestjs/typeorm'
import {Maintenance} from 'src/maintenance/entities/maintenance.entity'

@Injectable()
export class HistoryMaintenanceService {
  constructor (
    @InjectRepository(HistoryMaintenance)
    private historyMaintenance: Repository<HistoryMaintenance>,
    @InjectRepository(Maintenance)
    private readonly maintenance: Repository<Maintenance>,
  ) {}
  create (createHistoryMaintenanceDto: CreateHistoryMaintenanceDto) {
    return this.historyMaintenance.save(createHistoryMaintenanceDto)
  }
  async findByProjectNow (idProject: number) {
    const currentDate = new Date()
    return this.historyMaintenance.find({
      where: {
        project: {id: idProject},
        timeStart: LessThanOrEqual(currentDate),
        timeEnd: MoreThanOrEqual(currentDate),
      },
      relations: ['project', 'maintenance'],
      order: {
        timeStart: 'DESC',
      },
    })
  }
  async findOneCanCreateMaintance (date: Date, idProject: number, numberCreate: number) {
    const isHistory = await this.historyMaintenance.find({
      where: {
        project: {id: idProject},
        timeStart: LessThanOrEqual(date),
        timeEnd: MoreThanOrEqual(date),
        countMaintenance: MoreThanOrEqual(numberCreate),
      },
      relations: ['project', 'maintenance'],
      order: {
        timeStart: 'ASC',
      },
    })
    for (let index = 0; index < isHistory.length; index++) {
      const element = isHistory[index]
      const isMaintenance = await this.maintenance.find({
        where: {
          historyMaintenance: {
            id: element.id,
          },
        },
        relations: ['historyMaintenance'],
      })

      if (element.countMaintenance > isMaintenance.length) {
        return element
      }
    }
    return
  }

  async findByProject (idProject: number) {
    return this.historyMaintenance.find({
      where: {
        project: {id: idProject},
      },
      relations: ['project', 'maintenance', 'maintenance.maintenanceActions'],
    })
  }

  async remove (id: number) {
    const maintenances = await this.maintenance.find({
      where: { historyMaintenance: { id: id } }
    })
    
    if (maintenances.length > 0) {
      await this.maintenance.remove(maintenances)
    }

    return this.historyMaintenance.delete(id)
  }
}
