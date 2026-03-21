import {LoginDto} from './staffs/dto/create-staff-logindto'
import {StaffsService} from './staffs/staffs.service'
import {Response, Request} from 'express'
import {ProjectEditService} from './project_edit/project_edit.service'
import {MaintenanceService} from './maintenance/maintenance.service'
import {ProjectService} from './project/project.service'
import {WorkflowStepsService} from './workflow_steps/workflow_steps.service'
import {Body, Controller, Get, Post, Render, Req, Res, SetMetadata} from '@nestjs/common'
import {SendMailService} from './send-mail/send-mail.service'
@Controller()
export class AppController {
  constructor (
    private staffsService: StaffsService,
    private projectEditService: ProjectEditService,
    private maintenanceService: MaintenanceService,
    private projectService: ProjectService,
    private workflowStepsService: WorkflowStepsService,
  ) {}

  @Get('forgot-password')
  @SetMetadata('isPublic', true)
  @Render('forgot-password')
  forgotPasswordG () {
    return {}
  }

  @Post('forgot-password')
  @SetMetadata('isPublic', true)
  @Render('forgot-password')
  async forgotPasswordP (@Body('email') email: string) {
    const ischeck = await this.staffsService.forgotPassword(email)
    if (ischeck) {
      return {message: 'Mât khẩu mới đã đươc gửi về email !', status: 'success'}
    } else {
      return {message: 'Email chưa đươc đang ký !', status: 'error'}
    }
  }

  @Get('quy-trinh-lam-viec')
  @Render('client/quytrinhmau')
  async quytrinhmau () {
    const allWorkflowSteps = await this.workflowStepsService.findAll()
    const workflowSteps = allWorkflowSteps.reduce((acc, workflowStep) => {
      const workflow = workflowStep.workflow
      const id = workflow.id
      if (!acc[id]) {
        acc[id] = {
          name: workflow.name,
          steps: [],
        }
      }
      acc[id].steps.push(workflowStep)
      return acc
    }, {})
    return {workflowSteps,activeMenu: 'quytrinhmau'}
  }
  @SetMetadata('permision', 'VIEW_DASHBOARD')
  @Get()
  @Render('admin/index')
  async renderIndexadmin (@Req() req: Request) {
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let projectEdits = null
    let maintenanceComing = null
    let maintenanceYc = null
    let maintenanceYcHt = null
    let countProject = null
    if (inforAccount.role_admin || (inforAccount.department.id == 1 && inforAccount.position.id == 1)) {
      projectEdits = await this.projectEditService.findAll()
      maintenanceComing = await this.maintenanceService.findAllMaintenanceComing()
      maintenanceYc = await this.maintenanceService.maintenanceYc()
      maintenanceYcHt = await this.maintenanceService.maintenanceYcHt()
      countProject = await this.projectService.countProjectByMonth()
    } else {
      projectEdits = await this.projectEditService.findProjectEditByBusines(+inforAccount.id)
      maintenanceComing = await this.maintenanceService.findAllMaintenanceComingByBusines(+inforAccount.id)
      maintenanceYc = await this.maintenanceService.maintenanceYcByBusines(+inforAccount.id)
      maintenanceYcHt = await this.maintenanceService.maintenanceYcHtByBusines(+inforAccount.id)
      countProject = await this.projectService.countProjectByMonthByBusines(+inforAccount.id)
    }
    return {
      projectEdits,
      maintenanceComing,
      maintenanceYc,
      maintenanceYcHt,
      countProject,
      activeMenu: 'VIEW_DASHBOARD',
    }
  }

  @Get('login')
  @SetMetadata('isPublic', true)
  @Render('login')
  loginRender () {
    return {activeMenu: 'login'}
  }
  @Get('/logout')
  @Render('login')
  logout (@Res() res: Response) {
    res.clearCookie('token')
    return {message: 'Đăng xuất thành công!', status: 'success', activeMenu: 'login'}
  }
  @Post('login')
  @SetMetadata('isPublic', true)
  async login (@Body() loginDto: LoginDto, @Res() res: Response, @Req() req: Request) {
    console.log('[DEBUG-CTRL] 1. Calling staffsService.login...');
    let token;
    try {
      token = await this.staffsService.login(loginDto)
    } catch(e) {
      console.log('[DEBUG-CTRL] Error in staffsService.login:', e.message);
      throw e;
    }
    console.log('[DEBUG-CTRL] 2. Has token:', !!token);
    if (!token) {
      res.render('login', {
        message: 'Email hoặc mật khẩu không hợp lệ!',
        status: 'error',
      })
    } else {
      res.cookie('token', token)
      console.log('[DEBUG-CTRL] 3. Verifying payload...');
      try {
        const payload = await this.staffsService.payload(token)
        console.log('[DEBUG-CTRL] 4. Payload retrieved:', payload?.email);
        if (payload.role_admin) {
          console.log('[DEBUG-CTRL] 5. Redirecting admin...');
          res.redirect('/')
        } else {
          console.log('[DEBUG-CTRL] 5. Redirecting staff...');
          res.redirect('/client/list-task')
        }
      } catch(err) {
        console.log('[DEBUG-CTRL] Error measuring payload:', err.message);
        throw err;
      }
    }
  }
}
