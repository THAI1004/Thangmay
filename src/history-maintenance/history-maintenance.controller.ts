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

  @Post('edit/:id')
  async edit(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
      await this.historyMaintenanceService.update(+id, {
          timeStart: body.timeStart,
          timeEnd: body.timeEnd
      });
      res.redirect('back');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.historyMaintenanceService.remove(+id)
      return res.status(200).json({ status: 'success', message: 'Xóa lịch sử gia hạn bảo trì thành công' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ status: 'error', message: 'Xóa thất bại' })
    }
  }
}
