import { Controller, Get, Body, Patch, Param, Delete, Render, SetMetadata } from '@nestjs/common';
import { ProjectStaffService } from './project_staff.service'
import { UpdateProjectStaffDto } from './dto/update-project_staff.dto'
import { TargetBusinesService } from 'src/target_busines/target_busines.service'
@Controller('project-staff')
export class ProjectStaffController {
  constructor(
    private readonly projectStaffService: ProjectStaffService,
    private readonly targetBusinesService: TargetBusinesService,
  ) {}
  @SetMetadata('permision', 'MANAGE_SALES_STAFF')
  @Get('busines/:idStaff')
  @Render('admin/staff/busines_detail')
  async findBusinesDeatil(@Param('idStaff') id: string) {
    const dealineBusines = await this.targetBusinesService.findAllWStaff(+id)
    const staffsBusines = await this.projectStaffService.findProjectStaffByMonth(+id)
    return {staffsBusines: staffsBusines.monthlyDetails, dealineBusines, staffId: id, activeMenu: 'staffs/business'}
  }
  @Get()
  @Render('admin/staff/business')
  async findAllList() {
    const staffsBusiness = await this.projectStaffService.findAllList()
    return {staffsBusiness, activeMenu: 'staffs/business'}
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectStaffService.remove(+id)
  }
}
