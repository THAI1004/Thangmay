import {Controller, Get, Post, Body, Patch, Param, Delete, Req, SetMetadata} from '@nestjs/common'
import {ProjectEditService} from './project_edit.service'
import {CreateProjectEditDto} from './dto/create-project_edit.dto'
import {UpdateProjectEditDto} from './dto/update-project_edit.dto'
import {StaffsService} from 'src/staffs/staffs.service'
import {ProjectService} from 'src/project/project.service'
import {Request, Response} from 'express'
import {Res} from '@nestjs/common'
@Controller('project-edit')
export class ProjectEditController {
  constructor (
    private readonly projectEditService: ProjectEditService,
    private readonly staffsService: StaffsService,
    private readonly projectService: ProjectService,
  ) {}
  @Post('/delete/:idProjectEdit')
  async deleteProjectEdit (@Param('idProjectEdit') idProjectEdit: number) {
    return await this.projectEditService.remove(idProjectEdit)
  }

  @Post('/:idProject')
  async create (
    @Param('idProject') idProject: number,
    @Body() createProjectEditDto: CreateProjectEditDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const infor_product = {
      dongCo: createProjectEditDto.dongCo,
      congSuat: createProjectEditDto.congSuat,
      tuDien: createProjectEditDto.tuDien,
      capTai: createProjectEditDto.capTai,
      hoThang: createProjectEditDto.hoThang,
      cabin: createProjectEditDto.cabin,
      cua: createProjectEditDto.cua,
      pit: createProjectEditDto.pit,
      oh: createProjectEditDto.oh,
      phongMay: createProjectEditDto.phongMay,
    }
    const token = req.cookies['token']
    if (token) {
      const payload = await this.staffsService.payload(token)
      const idStaff = payload.id
      const staff = await this.staffsService.findOne(idStaff)
      const project = await this.projectService.findOne(idProject)
      const newProject = {
        ...createProjectEditDto,
        staff: staff,
        project: project,
        infor_product: JSON.stringify(infor_product),
      }
      await this.projectEditService.create(newProject)
      res.redirect('back')
    } else {
      res.redirect('/login')
    }
  }
}
