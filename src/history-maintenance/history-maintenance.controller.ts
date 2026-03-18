import {Controller, Get, Post, Body, Patch, Param, Delete, Res, Render} from '@nestjs/common'
import {HistoryMaintenanceService} from './history-maintenance.service'
import {CreateHistoryMaintenanceDto} from './dto/create-history-maintenance.dto'
import {UpdateHistoryMaintenanceDto} from './dto/update-history-maintenance.dto'
import {Response, Request} from 'express'
import {ProjectService} from 'src/project/project.service'

@Controller('history-maintenance')
export class HistoryMaintenanceController {
  constructor (
    private readonly historyMaintenanceService: HistoryMaintenanceService,
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  async create (@Res() res: Response, @Body() createHistoryMaintenanceDto: CreateHistoryMaintenanceDto) {
    createHistoryMaintenanceDto.price = createHistoryMaintenanceDto.free == true ? 0 : createHistoryMaintenanceDto.price
    await this.historyMaintenanceService.create(createHistoryMaintenanceDto)
    res.redirect(`/maintenance/project/${createHistoryMaintenanceDto.project}`)
  }

  @Get(':idProject')
  @Render('admin/historyMaintaenance/list')
  async listHistoryByIdProject (@Param('idProject') idProject: number) {
    const project = await this.projectService.findOne(+idProject)
    const listHistory = await this.historyMaintenanceService.findByProject(idProject)
    return {listHistory, project, activeMenu: 'historyMaintaenance/list'}
  }
}
