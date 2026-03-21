import { Maintenance } from 'src/maintenance/entities/maintenance.entity'
import { Controller, Get, Post, Body, Patch, Param, Render, Res, Req, Query, SetMetadata, Delete } from '@nestjs/common'
import { ProjectService } from './project.service'
import { CreateProjectDto, CreateProjectMaintenanceDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { WorkflowStepsService } from 'src/workflow_steps/workflow_steps.service'
import { WorkflowsService } from 'src/workflows/workflows.service'
import { Request, Response } from 'express'
import { StepsService } from 'src/steps/steps.service'
import { StaffsService } from 'src/staffs/staffs.service'
import { ProjectStepsService } from 'src/project_steps/project_steps.service'
import { ProjectEditService } from 'src/project_edit/project_edit.service'
import { NotificationService } from 'src/notification/notification.service'
import { SendMailService } from 'src/send-mail/send-mail.service'
import { MailerService } from '@nestjs-modules/mailer'
import { MaintenanceService } from 'src/maintenance/maintenance.service'
import { DepartmensService } from 'src/departmens/departmens.service'
import { ProjectStaffService } from 'src/project_staff/project_staff.service'
import { validate } from 'class-validator'
import * as ExcelJS from 'exceljs'

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly workflowsService: WorkflowsService,
    private readonly workflowStepsService: WorkflowStepsService,
    private readonly stepsService: StepsService,
    private readonly staffsService: StaffsService,
    private readonly projectStepsService: ProjectStepsService,
    private readonly projectEditService: ProjectEditService,
    private readonly notificationService: NotificationService,
    private readonly sendMailService: SendMailService,
    private readonly mailerService: MailerService,
    private readonly maintenanceService: MaintenanceService,
    private readonly departmensService: DepartmensService,
    private readonly projectStaffService: ProjectStaffService,
  ) { }
  @Get('/maintenance/localtion/:localtionName')
  @Render('admin/maintenance/maintenance_localtion')
  async filterMaintenanceByLocaltion(@Param('localtionName') localtionName: string, @Req() req: Request) {
    const maintenances = await this.projectService.findAllByLocaltion(localtionName)
    return { localtionName, maintenances, activeMenu: 'VIEW_PROJECT_STATISTICS' }
  }
  @SetMetadata('permision', 'VIEW_PROJECT_STATISTICS')
  @Get('statistical/export')
  async exportExcel(@Res() res: Response) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Thống kê')
    // Set width cột
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 7 },
      { header: 'Nội dung', key: 'noiDung', width: 70 },
      { header: 'Số lượng', key: 'soLuong', width: 15 },
    ]
    // Định nghĩa hàm tạo dòng nhóm (header xanh)
    let rowIndex = 2
    const addGroupRow = (stt: string, noiDung: string, soLuong: number) => {
      const row = worksheet.addRow({ stt, noiDung, soLuong })
      row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '3DCD3D' },
        }
      })
      worksheet.getRow(rowIndex).height = 40
      worksheet.getRow(rowIndex).alignment = { vertical: 'middle' }
      rowIndex++
    }
    const addNormalRow = (stt: string, noiDung: string, soLuong: number) => {
      worksheet.addRow({ stt, noiDung, soLuong })
      worksheet.getRow(rowIndex).height = 30
      worksheet.getRow(rowIndex).alignment = { vertical: 'middle' }
      rowIndex++
    }
    // === DỮ LIỆU GIẢ ĐỊNH ===
    const statisticalWarranty = await this.projectService.statisticalWarranty()
    // Danh sách công trình bảo trì miễn phí
    const statisticalMaintenanceFree = await this.projectService.statisticalMaintenanceFree()
    // Danh sách công trình bảo trì mất phí
    const statisticalMaintenance = await this.projectService.statisticalMaintenance()

    // ============== Xuất bảng giống ảnh =====================
    // Nhóm 1: Bảo hành
    addGroupRow('1', 'Tổng số lượng thang máy trong thời gian bảo hành', statisticalWarranty.tong)
    addNormalRow('1.1', 'Hà Nội', statisticalWarranty.haNoi)
    addNormalRow('1.2', 'Quảng Ninh', statisticalWarranty.quangNinh)
    addNormalRow('1.3', 'Khác', statisticalWarranty.khac)
    // Nhóm 2: Bảo trì theo HĐ
    addGroupRow(
      '2',
      'Tổng số lượng thang máy trong thời gian bảo trì có thu phí',
      statisticalMaintenanceFree.tong,
    )
    addNormalRow('2.1', 'Hà Nội', statisticalMaintenanceFree.haNoi)
    addNormalRow('2.2', 'Quảng Ninh', statisticalMaintenanceFree.quangNinh)
    addNormalRow('2.3', 'Khác', statisticalMaintenanceFree.khac)
    // Nhóm 3: Bảo trì mất phí
    addGroupRow('3', 'Tổng số lượng thang máy trong thời gian bảo trì không thu phí', statisticalMaintenance.tong)
    addNormalRow('3.1', 'Hà Nội', statisticalMaintenance.haNoi)
    addNormalRow('3.2', 'Quảng Ninh', statisticalMaintenance.quangNinh)
    addNormalRow('3.3', 'Khác', statisticalMaintenance.khac)
    // ==============================================
    // Gửi file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=thongke.xlsx')
    await workbook.xlsx.write(res)
    res.end()
  }
  @SetMetadata('permision', 'VIEW_PROJECT_STATISTICS')
  @Get('statistical')
  @Render('admin/statistical')
  async getStatistical() {
    // Danh sách công trình trong thời gian bảo hành
    const statisticalWarranty = await this.projectService.statisticalWarranty()
    // Danh sách công trình bảo trì miễn phí
    const statisticalMaintenanceFree = await this.projectService.statisticalMaintenanceFree()
    // Danh sách công trình bảo trì mất phí
    const statisticalMaintenance = await this.projectService.statisticalMaintenance()
    //  
    return { statisticalWarranty, statisticalMaintenanceFree, statisticalMaintenance }
  }

  @Get('add/maintenance')
  @Render('admin/projects/add_projects_maintenance')
  getAdd() {
    return {
      activeMenu: 'project/maintenance',
    }
  }

  @Patch('SuccessProject/:id')
  async SuccessProject(@Param('id') id: string, @Res() res: Response) {
    await this.projectService.updateStatusProject(+id)
    return res.redirect('back')
  }

  @Post('maintenance')
  async createProjectMaintenance(@Body() createProjectDto: CreateProjectMaintenanceDto, @Res() res: Response) {
    if (createProjectDto.address) {
      createProjectDto.address = `${createProjectDto.city}, ${createProjectDto.district},${createProjectDto.ward}, ${createProjectDto.address}`
    } else {
      createProjectDto.address = `${createProjectDto.city}, ${createProjectDto.district},${createProjectDto.ward}`
    }
    // <+====================Tạo project====================+>
    const errors = await validate(createProjectDto)
    if (errors.length > 0) {
      // Lấy danh sách lỗi và chuyển thành mảng thông báo
      const errorMessages = errors
        .map((err) => {
          return err.constraints ? Object.values(err.constraints).join(', ') : 'Unknown error'
        })
        .filter(Boolean)

      if (errorMessages.length > 0) {
        return res.render('400', { errors: errorMessages })
      }
    }
    const infor_product = {
      dongCo: createProjectDto.dongCo,
      congSuat: createProjectDto.congSuat,
      tuDien: createProjectDto.tuDien,
      capTai: createProjectDto.capTai,
      hoThang: createProjectDto.hoThang,
      cabin: createProjectDto.cabin,
      cua: createProjectDto.cua,
      pit: createProjectDto.pit,
      oh: createProjectDto.oh,
      phongMay: createProjectDto.phongMay,
    }
    const newProject = {
      ...createProjectDto,
      workflow: null,
      infor_product: JSON.stringify(infor_product),
    }
    const Project = await this.projectService.createProjectMaintenance(newProject)
    // <+====================Tạo project_step====================+>
    return res.redirect('/project/maintenance')
  }
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Res() res: Response, @Req() req: Request) {

    if (createProjectDto.address) {
      createProjectDto.address = `${createProjectDto.city}, ${createProjectDto.district},${createProjectDto.ward}, ${createProjectDto.address}`
    } else {
      createProjectDto.address = `${createProjectDto.city}, ${createProjectDto.district},${createProjectDto.ward}`
    }
    // <+====================Tạo project====================+>
    const errors = await validate(createProjectDto)
    if (errors.length > 0) {
      // Lấy danh sách lỗi và chuyển thành mảng thông báo
      const errorMessages = errors
        .map((err) => {
          // Nếu type=2 thì bỏ qua lỗi workflow
          return err.constraints ? Object.values(err.constraints).join(', ') : 'Unknown error'
        })
        .filter(Boolean)

      if (errorMessages.length > 0) {
        return res.render('400', { errors: errorMessages })
      }
    }
    const infor_product = {
      dongCo: createProjectDto.dongCo,
      congSuat: createProjectDto.congSuat,
      tuDien: createProjectDto.tuDien,
      capTai: createProjectDto.capTai,
      hoThang: createProjectDto.hoThang,
      cabin: createProjectDto.cabin,
      cua: createProjectDto.cua,
      pit: createProjectDto.pit,
      oh: createProjectDto.oh,
      phongMay: createProjectDto.phongMay,
    }
    
    const newProject = {
      ...createProjectDto,
      infor_product: JSON.stringify(infor_product),
    }
    const Project = await this.projectService.create(newProject)



    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    const arr = createProjectDto.staffMain
    if (inforAccount.department.id == 1 && inforAccount.position.id == 1) {
      if (arr != null && arr.length > 0) {
        const count = arr.reduce((acc, num) => {
          acc[num] = (acc[num] || 0) + 1
          return acc
        }, {})
        const duplicates = Object.keys(count).filter((key) => count[key] > 1)
        const result = [...new Set([...arr, ...duplicates])]
        const result2 = result.filter((item) => item !== '')
        if (result2.length > 0) {
          for (const staff of result2) {
            const Staff = await this.staffsService.findOne(+staff)
            if (Staff) {
              await this.notificationService.create({
                title: 'Thông báo công trình mới !!!',
                message: `Bạn được giao phụ trách tại công trình :${Project.full_name}`,
                staff: Staff,
                project: Project,
              })
              await this.projectStaffService.create({
                project: Project,
                staff: Staff,
              })
            }
          }
        }
      }
    }
    
    let workflowSteps = await this.workflowStepsService.findWorkflow(+createProjectDto.workflow)
    const stepsArray = JSON.parse(createProjectDto.steps)
    const validStepIds = workflowSteps.map((step) => step.id)
    let workflowStepIds = workflowSteps.map((step) => step.id)
    //Data sử dụng
    const filteredStepsArray = stepsArray.filter((step) => validStepIds.includes(Number(step.idStep)))
    const stepNulls = workflowStepIds.filter((id) => !filteredStepsArray.some((step) => +step.idStep === id))
    //Data sử dụng
    for (const stepNull of stepNulls) {
      const WorkflowSteps = await this.workflowStepsService.findOne(stepNull)
      await this.projectStepsService.create({
        workflowStep: WorkflowSteps,
        project: Project,
        staff: null,
        weight: null,
      })
    }

    for (const step of filteredStepsArray) {
      const WorkflowSteps = await this.workflowStepsService.findOne(step.idStep)
      const Staff = await this.staffsService.findOne(step.idStaffCheck)
      await this.projectStepsService.create({
        workflowStep: WorkflowSteps,
        project: Project,
        staff: Staff,
        weight: Number(step.weight),
      })
      // Tạo thông báo
      await this.notificationService.create({
        title: 'Thông báo về nhiệm vụ mới của bạn !!!',
        message: `${WorkflowSteps.step.name} tại công trình :${Project.full_name}`,
        staff: Staff,
        project: Project,
      })
      // send mail thông báo
      const contentSendMail = await this.sendMailService.notificationNewJob(
        Staff.full_name,
        Staff.email,
        'Thông báo nhiệm vụ mới !!!',
        `Chúng tôi xin thông báo về nhiệm vụ mới của bạn tại <strong>Thang máy Tesla </strong> <br> <div class="password">Bạn cần ${WorkflowSteps.step.name} tại công trình :${Project.full_name}</div> `,
      )
      this.mailerService
        .sendMail(contentSendMail)
        .then(() => { })
        .catch((error) => {
          console.error('Error sending email:', error)
          return { message: 'Gửi mail thất bại!', error: error.message }
        })
    }
    return res.redirect('/project/trang-thai/tat-ca')
  }
  @Patch('/:id')
  async updateP(
    @Body() updateProjectDto: UpdateProjectDto,
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    
    if (!updateProjectDto.checkEdit) {
      if (updateProjectDto.address) {
        updateProjectDto.address = `${updateProjectDto.city}, ${updateProjectDto.district},${updateProjectDto.ward}, ${updateProjectDto.address}`
      } else {
        updateProjectDto.address = `${updateProjectDto.city}, ${updateProjectDto.district},${updateProjectDto.ward}`
      }
    }
    const project = await this.projectService.findOne(+id)
    const arr = updateProjectDto.staffMain
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    if (inforAccount.department.id == 1 && inforAccount.position.id == 1) {
      if (arr != null && arr.length > 0) {
        const count = arr.reduce((acc, num) => {
          acc[num] = (acc[num] || 0) + 1
          return acc
        }, {})
        const duplicates = Object.keys(count).filter((key) => count[key] > 1)
        const result = [...new Set([...arr, ...duplicates])]
        const result2 = result.filter((item) => item !== '')
        console.log(result2)
        console.log(result2.length)
        if (result2.length > 0) {
          for (const staff of result2) {
            const Staff = await this.staffsService.findOne(+staff)
            if (Staff) {
              await this.notificationService.create({
                title: 'Thông báo công trình mới !!!',
                message: `Bạn được giao phụ trách tại công trình :${project.full_name}`,
                staff: Staff,
                project: project,
              })

              // SEND MAIL
              const contentSendMail = await this.sendMailService.notificationNewProjectManager(
                Staff.full_name,
                Staff.email,
                'Thông báo công trình phụ trách mới !!!',
                `Chúng tôi xin thông báo về công trình phụ trách mới của bạn tại <strong>Thang máy Tesla </strong> <br> <div class="password">Bạn cần phụ trách công trình:${project.full_name}</div> `,
              )
              
              await this.mailerService.sendMail(contentSendMail).catch((error) => {
                console.error('Error sending email:', error)
              })

              await this.projectStaffService.create({
                project: project,
                staff: Staff,
              })
            }
          }
        }
      }
    }
    const infor_product = {
      dongCo: updateProjectDto.dongCo,
      congSuat: updateProjectDto.congSuat,
      tuDien: updateProjectDto.tuDien,
      capTai: updateProjectDto.capTai,
      hoThang: updateProjectDto.hoThang,
      cabin: updateProjectDto.cabin,
      cua: updateProjectDto.cua,
      pit: updateProjectDto.pit,
      oh: updateProjectDto.oh,
      phongMay: updateProjectDto.phongMay,
    }
    if (inforAccount.department.id == 1 && inforAccount.position.id == 1) {
      await this.projectService.update(+id, {
        code_project: updateProjectDto.code_project,
        full_name: updateProjectDto.full_name,
        price: updateProjectDto.price,
        tax: updateProjectDto.tax,
        number_phone: updateProjectDto.number_phone,
        email: updateProjectDto.email,
        address: updateProjectDto.address,
        description: updateProjectDto.description,
        infor_product: JSON.stringify(infor_product),
      })
    } else {
      const token = req.cookies['token']
      const payload = await this.staffsService.payload(token)
      const idStaff = payload.id
      const staff = await this.staffsService.findOne(idStaff)
      const project = await this.projectService.findOne(id)
      const dataEditProject = {
        code_project: updateProjectDto.code_project,
        full_name: updateProjectDto.full_name,
        price: updateProjectDto.price,
        tax: updateProjectDto.tax,
        number_phone: updateProjectDto.number_phone,
        email: updateProjectDto.email,
        address: updateProjectDto.address,
        description: updateProjectDto.description,
        infor_product: JSON.stringify(infor_product),
        staff: staff,
        project: project,
        workflow: null,
      }
      await this.projectEditService.create(dataEditProject)
    }
    if (updateProjectDto.steps) {
      const ArrayIdProjectStepNew = []
      const ArrayIdProjectStepOld = []
      const findByProjects = await this.projectStepsService.findByProject(id)
      for (const findByProject of findByProjects) {
        ArrayIdProjectStepOld.push(findByProject.id)
      }
      const stepsArray = await JSON.parse(updateProjectDto.steps)
      for (const step of stepsArray) {
        const WorkflowSteps = await this.workflowStepsService.findOne(step.idStep)
        const Staff = await this.staffsService.findOne(+step.idStaffCheck)
        const CheckTT = await this.projectStepsService.findWWorkflowStepsStaffProject(project, WorkflowSteps, Staff)
        if (CheckTT.length == 0) {
          const findWStaffAWeightNull = await this.projectStepsService.findWStaffAWeightNull(WorkflowSteps, project)
          if (findWStaffAWeightNull) {
            for (let index = 0; index < findWStaffAWeightNull.length; index++) {
              await this.projectStepsService.delete(+findWStaffAWeightNull[index].id)
            }
          }
          const addProjectStep = await this.projectStepsService.create({
            workflowStep: WorkflowSteps,
            project: project,
            staff: Staff,
            weight: step.weight,
          })
          await this.notificationService.create({
            title: 'Thông báo nhiệm vụ mới !!!',
            message: `Bạn cần ${WorkflowSteps.step.name} tại công trình :${project.full_name}`,
            staff: Staff,
            project: project,
          })
          const contentSendMail = await this.sendMailService.notificationNewJob(
            Staff.full_name,
            Staff.email,
            'Thông báo nhiệm vụ mới !!!',
            `Chúng tôi xin thông báo về nhiệm vụ mới của bạn tại <strong>Thang máy Tesla </strong> <br> <div class="password">Bạn cần ${WorkflowSteps.step.name} tại công trình :${project.full_name}</div> `,
          )
          this.mailerService
            .sendMail(contentSendMail)
            .then(() => { })
            .catch((error) => {
              console.error('Error sending email:', error)
              return { message: 'Gửi mail thất bại!', error: error.message }
            })
          ArrayIdProjectStepNew.push(addProjectStep.id)
        } else {
          for (const CheckT of CheckTT) {
            ArrayIdProjectStepNew.push(CheckT.id)
          }
        }
      }
      const ArrayIdProjectStepDelete = ArrayIdProjectStepOld.filter((id) => !ArrayIdProjectStepNew.includes(id))
      for (const [index, id] of ArrayIdProjectStepDelete.entries()) {
        const projectStep = await this.projectStepsService.findOne(+id)
        await this.notificationService.create({
          title: 'Thông báo loại khỏi công việc !!!',
          message: `Bạn không cần ${projectStep.workflowStep.step.name} tại công trình :${projectStep.project.full_name} nữa`,
          staff: projectStep.staff,
          project: project,
        })
        const contentSendMail = await this.sendMailService.notificationRemoveKJob(
          projectStep.staff.full_name,
          projectStep.staff.email,
          'Thông báo loại khỏi công việc !!!',
          `Bạn không cần ${projectStep.workflowStep.step.name} tại công trình :${projectStep.project.full_name} nữa, Xin cảm ơn.`,
        )
        this.mailerService
          .sendMail(contentSendMail)
          .then(() => { })
          .catch((error) => {
            console.error('Error sending email:', error)
            return { message: 'Gửi mail thất bại!', error: error.message }
          })
        const projectStepAll = await this.projectStepsService.findWworkflowStepAProject(
          projectStep.workflowStep.id,
          projectStep.project.id,
        )
        if (projectStepAll.length == 1) {
          await this.projectStepsService.update(
            { id: +id },
            {
              weight: null,
              staff: null,
              status: null,
              feedback: null,
              image: null,
            },
          )
        } else {
          await this.projectStepsService.delete(+id)
        }
      }
    }
    return res.redirect('back')
  }
  @SetMetadata('permision', 'MANAGE_PROJECTS')
  @Get('/add')
  @Render('admin/projects/add_project')
  async renderAdd(
    @Query('full_name') fullName: string,
    @Query('number_phone') numberPhone: string,
    @Query('email') email: string,
    @Query('address') address: string,
    @Query('description') description: string,
    @Req() req: Request,
  ) {
    const departments = await this.departmensService.findAll()
    const workflows = await this.workflowsService.findAll()
    const steps = await this.stepsService.findAll()
    const workflowSteps = await this.workflowStepsService.findAll()
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
      departments,
      workflows,
      steps,
      workflowSteps,
      staffs,
      data: {
        fullName,
        numberPhone,
        email,
        address,
        description,
      },
    }
  }
  @SetMetadata('permision', 'MANAGE_PROJECTS')
  @Get('/trang-thai/:status')
  @Render('admin/projects/projects')
  async filterProjects(@Param('status') status: string, @Req() req: Request) {
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let projects = null
    let status2 = 2
    if (status == 'da-hoan-thanh') {
      status2 = 1
    } else if (status == 'dang-thuc-hien') {
      status2 = 0
    }
    const hasPermission = inforAccount.permisions && inforAccount.permisions.some((p) => p.code === 'MANAGE_PROJECTS');
    if (inforAccount.role_admin || (inforAccount.department.id == 1 && inforAccount.position.id == 1) || hasPermission) {
      projects = await this.projectService.findAllStatus(status2)
    } else {
      projects = await this.projectService.findByStaffId(inforAccount.id, status2)
    }
    return {
      projects,
    }
  }
  @SetMetadata('permision', 'MANAGE_MAINTENANCE')
  @Get('/maintenance')
  @Render('admin/projects/projects_maintenance')
  async filterProjectsMaintennce(@Param('status') status: string, @Req() req: Request) {
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let projects = null
    const hasPermission = inforAccount.permisions && inforAccount.permisions.some((p) => p.code === 'MANAGE_MAINTENANCE');
    if (inforAccount.role_admin || (inforAccount.department.id == 1 && inforAccount.position.id == 1) || hasPermission) {
      projects = await this.projectService.findAllProjectsMaintennce()
    } else {
      projects = await this.projectService.findProjectsMaintennceByStaffId(inforAccount.id)
    }
    return {
      projects,
      activeMenu: 'project/maintenance',
    }
  }

  @SetMetadata('permision', 'MANAGE_MAINTENANCE')
  @Get('/maintenance-free')
  @Render('admin/projects/projects_maintenance_free')
  async filterProjectsMaintenanceFree(@Req() req: Request) {
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let projects = null
    const hasPermission = inforAccount.permisions && inforAccount.permisions.some((p) => p.code === 'MANAGE_MAINTENANCE');
    if (inforAccount.role_admin || (inforAccount.department.id == 1 && inforAccount.position.id == 1) || hasPermission) {
      projects = await this.projectService.findAllProjectsMaintenanceFree()
    } else {
      projects = await this.projectService.findProjectsMaintenanceFreeByStaffId(inforAccount.id)
    }
    return {
      projects,
      activeMenu: 'project/maintenance-free',
    }
  }


  @Delete('/maintenance/:id')
  async removeMaintenanceProject(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.maintenanceService.removeAllByProjectId(+id);
      await this.projectService.removeMaintenanceProject(+id);
      return res.status(200).json({ status: 'success', message: 'Xóa thành công' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
  @Get('/maintenance/:id')
  @Render('admin/projects/edit_project_maintenance')
  async findOneMaintenance(@Param('id') id: number, @Req() req: Request) {
    const departments = await this.departmensService.findAll()
    const project = await this.projectService.findOne(+id)
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
      departmentCanPick: inforAccount.department.id,
      departments,
      project,
      staffs,
      activeMenu: 'project/maintenance',
    }
  }
  @Get('/:id')
  @Render('admin/projects/edit_project')
  async findOne(@Param('id') id: number, @Req() req: Request) {
    const departments = await this.departmensService.findAll()
    const project = await this.projectService.findOne(+id)
    
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let staffs = null
    if (inforAccount.role_admin) {
      staffs = await this.staffsService.findAll()
    } else {
      staffs = await this.staffsService.findStaffsByDepartment(inforAccount.department.id)
    }
    const workflows = await this.workflowsService.findAll()
    const steps = await this.stepsService.findAll()
    const ProjectSteps = await this.projectStepsService.findProject(id)
    return {
      departmentCanPick: inforAccount.department.id,
      departments,
      project,
      ProjectSteps,
      workflows,
      steps,
      staffs,
    }
  }
  @Post('/addWarranty/:id')
  async addWarranty(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.projectService.update(+id, updateProjectDto)
    res.redirect('back')
  }
  @Post('/addmaintenanceFit/:id')
  async addmaintenanceFit(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.projectService.update(+id, updateProjectDto)
    res.redirect('back')
  }
  @Get('/checkEdit/:projectEdit')
  @Render('admin/projects/checkEdit_project')
  async checkEdit(@Param('projectEdit') projectEditId: number) {
    const projectEdit = await this.projectEditService.findOne(+projectEditId)
    
    const project = await this.projectService.findOne(+projectEdit.project.id)
    
    return { projectEdit, project}
  }
}
