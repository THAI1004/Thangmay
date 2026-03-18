import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
  Res,
  Req,
  UseInterceptors,
  UploadedFiles,
  SetMetadata,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Response, Request } from "express";
import { StaffsService } from "src/staffs/staffs.service";
import { ProjectStepsService } from "src/project_steps/project_steps.service";
import { ProjectService } from "src/project/project.service";
import { WorkflowStepsService } from "src/workflow_steps/workflow_steps.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { MaintenanceActionsService } from "src/maintenance_actions/maintenance_actions.service";
import { ProjectStaffService } from "src/project_staff/project_staff.service";

@Controller("client")
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly staffsService: StaffsService,
    private readonly projectStepsService: ProjectStepsService,
    private readonly projectService: ProjectService,
    private readonly workflowStepsService: WorkflowStepsService,
    private readonly maintenanceActionsService: MaintenanceActionsService,
    private readonly projectStaffService: ProjectStaffService
  ) {}
  @Post("/task/:id")
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }
  @SetMetadata('permision', 'VIEW_ASSIGNED_PROJECTS')
  @Get("list-project-responsibility")
  @Render("client/list_project_responsibility")
  async list_project_responsibility(@Res() res: Response, @Req() req: Request) {
    const token = req.cookies["token"];
    if (token) {
      const payload = await this.staffsService.payload(token);
      const idStaff = payload.id;
      const projectStaffs = await this.projectStaffService.findWStaff(idStaff);
      const projects = await this.projectService.findAll();
      return {
        projects,
        projectStaffs,
        activeMenu: 'VIEW_ASSIGNED_PROJECTS'
      };
    } else {
      res.redirect("/login");
    }
  }
  @Get("list-task")
  @Render("client/index")
  async renderIndex(@Res() res: Response, @Req() req: Request) {
    const token = req.cookies["token"];
    if (token) {
      const payload = await this.staffsService.payload(token);
      const idStaff = payload.id;
      const projectSteps =
        await this.projectStepsService.findDataWIdStaff(idStaff);
      const maintenance =
        await this.maintenanceActionsService.findAllWStaff(idStaff);
      const projectStaffs = await this.projectStaffService.findWStaff(idStaff);
      const projects = await this.projectService.findAll();
      return {
        projectSteps,
        maintenance,
        projects,
        projectStaffs,
        activeMenu: "listTask",
      };
    } else {
      res.redirect("/login");
    }
  }

  @Get("/task/:id")
  @Render("client/detail_project")
  async detailProject(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const token = req.cookies["token"];
    if (token) {
      const payload = await this.staffsService.payload(token);
      const idStaff = payload.id;
      const project = await this.projectService.findOne(+id);
      const projectSteps = await this.projectStepsService.findProject(+id);
      const maintenanceActions =
        await this.maintenanceActionsService.findProject(+id);
      const projectStaff = await this.projectStaffService.findWStaffAProject(
        +idStaff,
        +id
      );
      return {
        projectStaff,
        projectSteps,
        project,
        idStaff,
        maintenanceActions,
        activeMenu: 'list-task',
      };
    } else {
      res.redirect("/login");
    }
  }

  @Post("/confirmSuccessJob/:id")
  @UseInterceptors(
    FilesInterceptor("image", 10, {
      storage: diskStorage({
        destination: "./public/images/project",
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + extname(file.originalname);
          callback(null, file.fieldname + "-" + uniqueSuffix);
        },
      }),
    })
  )
  async SuccessJob(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @Res() res: Response,
    @Param("id") id: string,
    @Body("workflowStepId") workflowStepId: string,
    @Body("feedback") feedback: string
  ) {
    const token = req.cookies["token"];
    if (token) {
      const images = files.map((file) => file.filename);
      const image =  files.length > 0 ? JSON.stringify(images) : null;
      const payload = await this.staffsService.payload(token);
      const idStaff = payload.id;
      const staff = await this.staffsService.findOne(+idStaff);
      const project = await this.projectService.findOne(+id);
      const workflowStep =
        await this.workflowStepsService.findOne(+workflowStepId);
      await this.projectStepsService.updateStatusWProjectAWorkflowSteps(
        image,
        feedback,
        staff,
        project,
        workflowStep
      );
      res.redirect("back");
    } else {
      res.redirect("back");
    }
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.clientService.remove(+id);
  }
}
