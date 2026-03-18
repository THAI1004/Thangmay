import {Controller, Get, Post, Body, Patch, Param, Delete, Render, Res, SetMetadata} from '@nestjs/common'
import {WorkflowsService} from './workflows.service'
import {CreateWorkflowDto} from './dto/create-workflow.dto'
import {UpdateWorkflowDto} from './dto/update-workflow.dto'
import {Response} from 'express'
import {StepsService} from 'src/steps/steps.service'
import {WorkflowStepsService} from 'src/workflow_steps/workflow_steps.service'
import {ProjectStepsService} from 'src/project_steps/project_steps.service'
import {DepartmensService} from 'src/departmens/departmens.service'
@Controller('workflows')
export class WorkflowsController {
  constructor (
    private readonly workflowsService: WorkflowsService,
    private readonly departmensService: DepartmensService,
    private stepsService: StepsService,
    private workflowStepsService: WorkflowStepsService,
    private projectStepsService: ProjectStepsService,
  ) {}
  @Post()
  async create (@Body() createWorkflowDto: CreateWorkflowDto, @Res() res: Response) {
    const workflows = await this.workflowsService.create(createWorkflowDto)
    return res.redirect(`/workflows/${workflows}`)
  }
  @SetMetadata('permision', 'MANAGE_WORKFLOWS')
  @Get()
  @Render('admin/workflows/workflows')
  async findAll () {
    const workflows = await this.workflowsService.findAll()
    return {
      workflows,
      activeMenu: 'workflows',
    }
  }
  @SetMetadata('permision', 'MANAGE_WORKFLOWS')
  @Get(':id')
  @Render('admin/workflows/edit_workflows')
  async findOne (@Param('id') id: number) {
    const departmens = await this.departmensService.findAll()
    const checkEdit = await this.projectStepsService.findOneWWorkflows(+id)
    let canEdit = true
    if (checkEdit.length > 0) {
      canEdit = false
    }
    const steps = await this.stepsService.findAll()
    const workflowSteps = await this.workflowStepsService.findWorkflow(+id)
    let Picker = workflowSteps.map((workflowStep) => workflowStep.step.id)
    const steps2 = steps.map((step) => step.id)
    const NonePicker = steps2.filter((stepId) => !Picker.includes(stepId))
    const PickerIn = await Promise.all(
      Picker.map(async (element) => {
        return this.stepsService.findOne(+element)
      }),
    )
    const NonePickerIn = await Promise.all(
      NonePicker.map(async (element) => {
        return this.stepsService.findOne(+element)
      }),
    )
    const MaxIdStep = Math.max(...steps.map((step) => step.id))
    return {
      MaxIdStep,
      departmens,
      steps,
      PickerIn,
      NonePickerIn,
      canEdit,
      activeMenu: 'workflows',
    }
  }
  @SetMetadata('permision', 'MANAGE_WORKFLOWS')

  @Patch()
  async update (@Body('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto, @Res() res: Response) {
    await this.workflowsService.update(+id, updateWorkflowDto)
    return res.redirect('/workflows')
  }
  @SetMetadata('permision', 'MANAGE_WORKFLOWS')

  @Patch(':id')
  async updateQt (@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto, @Res() res: Response) {
    const checkEdit = await this.projectStepsService.findOneWWorkflows(+id)
    if (checkEdit.length <= 0) {
      await this.workflowStepsService.remove(+id)
      if (updateWorkflowDto.listStep) {
        for (const element of updateWorkflowDto.listStep) {
          await this.workflowStepsService.create({
            workflowId: +id,
            stepId: element,
          })
        }
      }
    }
    return res.redirect('/workflows')
  }
}
