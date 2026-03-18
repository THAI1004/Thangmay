import {Maintenance} from 'src/maintenance/entities/maintenance.entity'
import {Project} from 'src/project/entities/project.entity'
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, DeleteDateColumn} from 'typeorm'

@Entity()
export class HistoryMaintenance {
  @PrimaryGeneratedColumn()
  id: number
  @Column({type: 'date'})
  timeStart: Date
  @Column({type: 'date'})
  timeEnd: Date
  @Column()
  countMaintenance: number
  @Column()
  free: boolean
  @Column()
  price: number
  @ManyToOne(() => Project, (project) => project.historyMaintenance)
  project: Project
  @OneToMany(() => Maintenance, (maintenance) => maintenance.historyMaintenance)
  maintenance: Maintenance[]
  @DeleteDateColumn()
  deletedAt?: Date
}
