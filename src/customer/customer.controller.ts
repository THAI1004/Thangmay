import {Controller, Get, Post, Body, Patch, Param, Delete, Render, Res, SetMetadata, Req} from '@nestjs/common'
import {CustomerService} from './customer.service'
import {CreateCustomerDto} from './dto/create-customer.dto'
import {UpdateCustomerDto} from './dto/update-customer.dto'
import {Response, Request} from 'express'
import {StaffsService} from 'src/staffs/staffs.service'
import {DepartmensService} from 'src/departmens/departmens.service'

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly staffsService: StaffsService,
    private readonly departmensService: DepartmensService,
  ) {}

  @Post()
  async create(@Res() res: Response, @Body() createCustomerDto: CreateCustomerDto) {
    createCustomerDto.staff = await this.staffsService.findOne(+createCustomerDto.staffMain[0])
    if (createCustomerDto.address) {
      createCustomerDto.address = `${createCustomerDto.city}, ${createCustomerDto.district},${createCustomerDto.ward}, ${createCustomerDto.address}`
    } else {
      createCustomerDto.address = `${createCustomerDto.city}, ${createCustomerDto.district},${createCustomerDto.ward}`
    }
    await this.customerService.create(createCustomerDto)
    return res.redirect('/customer/infor')
  }
  @SetMetadata('permision', 'MANAGE_PLANNED_PROJECTS')
  @Get('add')
  @Render('admin/customer/add')
  async addCustomer(@Req() req: Request) {
    const departments = await this.departmensService.findAll()
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let staffs = null
    if (inforAccount.role_admin) {
      staffs = await this.staffsService.findAll()
    } else {
      staffs = await this.staffsService.findStaffsByDepartment(inforAccount.department.id)
    }
    const customers = await this.customerService.findAll()
    return {
      customers,
      departments,
      staffs,
      activeMenu: 'customer/add',
    }
  }
  @SetMetadata('permision', 'MANAGE_PLANNED_PROJECTS')
  @Get('infor')
  @Render('admin/customer/infor')
  async findAll() {
    const customers = await this.customerService.findAll()
    return {customers, activeMenu: 'customer/infor'}
  }

  @Get(':id')
  @Render('admin/customer/detail')
  async findOne(@Param('id') id: string, @Req() req: Request) {
     const departments = await this.departmensService.findAll()
    const token = req.cookies['token']
    const payload = await this.staffsService.payload(token)
    const inforAccount = await this.staffsService.findOne(payload.id)
    let staffs = null
    if (inforAccount.role_admin) {
      staffs = await this.staffsService.findAll()
    } else {
      staffs = await this.staffsService.findStaffsByDepartment(inforAccount.department.id)
    }
    const customer = await this.customerService.findOne(+id)
        return {
      customer,
      departments,
      staffs,
      activeMenu: 'customer',
    }
  }

  @Patch(':id')
  async update(@Res() res: Response, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    if (updateCustomerDto.staffMain) {
      updateCustomerDto.staffMain = await this.staffsService.findOne(+updateCustomerDto.staffMain[0])
    }

    if (updateCustomerDto.address) {
      updateCustomerDto.address = `${updateCustomerDto.city}, ${updateCustomerDto.district},${updateCustomerDto.ward}, ${updateCustomerDto.address}`
    } else {
      updateCustomerDto.address = `${updateCustomerDto.city}, ${updateCustomerDto.district},${updateCustomerDto.ward}`
    }
    const {city, district, ward, ...newUpdateCustomerDto} = updateCustomerDto
    await this.customerService.update(+id, newUpdateCustomerDto)
    return res.redirect(`/customer/${id}`)
  }

  @Delete(':id')
  async remove(@Res() res: Response, @Param('id') id: string) {
    await this.customerService.remove(+id)
    return res.redirect(`/customer/infor`)
  }
}
