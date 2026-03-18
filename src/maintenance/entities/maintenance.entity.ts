import {HistoryMaintenance} from 'src/history-maintenance/entities/history-maintenance.entity'
import {MaintenanceAction} from 'src/maintenance_actions/entities/maintenance_action.entity'
import {Project} from 'src/project/entities/project.entity'
import {Staff} from 'src/staffs/entities/staff.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  FindOperator,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Maintenance {
  find (arg0: {
    where: {
      historyMaintenance: {
        project: {id: number}
        timeStart: FindOperator<Date>
        timeEnd: FindOperator<Date>
        countMaintenance: FindOperator<number>
      }
    }
    relations: string[]
  }) {
    throw new Error('Method not implemented.')
  }
  @PrimaryGeneratedColumn()
  id: number
  @Column({type: 'date'})
  time: Date
  // @Column({default: true})
  // confirmSuccess: boolean
  @Column()
  reason: string
  @Column({type: 'date', nullable: true})
  actualDate: Date
  @Column({default: true})
  fee: boolean
  @Column({nullable: true})
  projectName: string
  @CreateDateColumn()
  createdAt: Date
  @UpdateDateColumn()
  updatedAt: Date
  @DeleteDateColumn()
  deletedAt?: Date
  @ManyToOne(() => Project, (project) => project.maintenances)
  project: Project
  @ManyToOne(() => HistoryMaintenance, (historyMaintenance) => historyMaintenance.maintenance)
  historyMaintenance: HistoryMaintenance
  @OneToMany(() => MaintenanceAction, (maintenanceAction) => maintenanceAction.maintenance)
  maintenanceActions: MaintenanceAction[]
}
