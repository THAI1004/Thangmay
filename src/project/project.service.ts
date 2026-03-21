import { Injectable } from '@nestjs/common'
import { CreateProjectDto, CreateProjectMaintenanceDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { LessThan, Like, MoreThan, Not, Repository } from 'typeorm'
import { relative } from 'path'
import { HistoryMaintenance } from 'src/history-maintenance/entities/history-maintenance.entity'
@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(HistoryMaintenance)
    private readonly historyMaintenanceRepository: Repository<HistoryMaintenance>,
  ) { }




  async findAllByLocaltion(localtionName: string, type: string) {
    try {
      const toDay = new Date();
      let projects = [];

      if (type === 'warranty') {
        projects = await this.projectRepository.find({
          where: {
            warrantyStart: LessThan(toDay),
            warrantyEnd: MoreThan(toDay),
          },
          relations: ['historyMaintenance', 'historyMaintenance.maintenance', 'historyMaintenance.maintenance.maintenanceActions'],
        });
      } else if (type === 'free') {
        projects = await this.projectRepository.find({
          where: {
            historyMaintenance: {
              timeStart: LessThan(toDay),
              timeEnd: MoreThan(toDay),
              free: true,
            },
          },
          relations: ['historyMaintenance', 'historyMaintenance.maintenance', 'historyMaintenance.maintenance.maintenanceActions'],
        });
      } else if (type === 'fee') {
        projects = await this.projectRepository.find({
          where: {
            historyMaintenance: {
              timeStart: LessThan(toDay),
              timeEnd: MoreThan(toDay),
              free: false,
            },
          },
          relations: ['historyMaintenance', 'historyMaintenance.maintenance', 'historyMaintenance.maintenance.maintenanceActions'],
        });
      } else {
        // Fallback for requests without type
        projects = await this.projectRepository.find({
          where: {
            historyMaintenance: {
              timeStart: LessThan(toDay),
              timeEnd: MoreThan(toDay),
            },
          },
          relations: ['historyMaintenance', 'historyMaintenance.maintenance', 'historyMaintenance.maintenance.maintenanceActions'],
        });
      }

      // ✅ Map and filter
      // Explicit deduplication
      const uniqueProjectsMap = new Map();
      projects.forEach(p => uniqueProjectsMap.set(p.id, p));
      projects = Array.from(uniqueProjectsMap.values());

      let filteredProjects = [];
      projects.forEach((element) => {
        const addr = element.address ? element.address.toUpperCase() : '';
        const isQuangNinh = addr.includes('QUẢNG NINH');
        const isHaNoi = !isQuangNinh && addr.includes('HÀ NỘI');
        const isKhac = !isQuangNinh && !isHaNoi;
        
        if (localtionName === 'Quảng Ninh' && isQuangNinh) {
          filteredProjects.push(element);
        } else if (localtionName === 'Hà Nội' && isHaNoi) {
          filteredProjects.push(element);
        } else if (localtionName === 'Tỉnh thành khác' && isKhac) {
          filteredProjects.push(element);
        }
      });

      const result = filteredProjects.map((proj) => {
        let countMaintenanceAllActionsStatusNotNull = 0;
        
        let activeHistory = null;
        if (proj.historyMaintenance && proj.historyMaintenance.length > 0) {
           activeHistory = proj.historyMaintenance.find(h => {
              const start = new Date(h.timeStart);
              const end = new Date(h.timeEnd);
              if (start >= toDay || end <= toDay) return false;
              if (type === 'free' && h.free !== true) return false;
              if (type === 'fee' && h.free !== false) return false;
              return true;
           });
        }
        
        if (activeHistory) {
          // Maintenance object logic
          if (activeHistory.maintenance && !Array.isArray(activeHistory.maintenance)) {
            const maint = activeHistory.maintenance as any;
            if (
              maint.maintenanceActions &&
              Array.isArray(maint.maintenanceActions) &&
              maint.maintenanceActions.length > 0 &&
              maint.maintenanceActions.every(
                (action) => action.status !== null && action.status !== undefined,
              )
            ) {
              countMaintenanceAllActionsStatusNotNull = 1;
            }
          }

          // Maintenance array logic
          if (Array.isArray(activeHistory.maintenance)) {
            activeHistory.maintenance.forEach((maint) => {
              if (
                maint.maintenanceActions &&
                Array.isArray(maint.maintenanceActions) &&
                maint.maintenanceActions.length > 0 &&
                maint.maintenanceActions.every(
                  (action) => action.status !== null && action.status !== undefined,
                )
              ) {
                countMaintenanceAllActionsStatusNotNull += 1;
              }
            });
          }
        }
        
        return {
          project: proj,
          free: activeHistory ? activeHistory.free : (type === 'fee' ? false : true),
          timeStart: activeHistory ? activeHistory.timeStart : proj.warrantyStart,
          timeEnd: activeHistory ? activeHistory.timeEnd : proj.warrantyEnd,
          countMaintenance: activeHistory ? activeHistory.countMaintenance : 0,
          maintenance: activeHistory && activeHistory.maintenance ? activeHistory.maintenance : [],
          countMaintenanceAllActionsStatusNotNull,
        };
      });

      return result;
    } catch (error) {
      console.error('❌ Lỗi tại findAllByLocaltion:', error);
      return [];
    }
  }

  async statisticalMaintenance() {
    const toDay = new Date()
    // lấy ra project dạng bảo trì mất phí
    // const projects = await this.projectRepository
    //   .createQueryBuilder('project')
    //   .leftJoinAndSelect('project.historyMaintenance', 'history')
    //   .where('project.type = :type', {type: 'BAOTRI'})
    //   .andWhere('history.timeStart < :toDay', {toDay})
    //   .andWhere('history.timeEnd > :toDay', {toDay})
    //   .andWhere('history.free = :free', {free: false})
    //   .getMany()
    const projects = await this.projectRepository.find({
      where: {
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: false,
        },
      },
      relations: ['historyMaintenance'],
    })
    const objData = {
      quangNinh: 0,
      haNoi: 0,
      khac: 0,
      tong: 0,
    }
    projects.forEach((element) => {
      if (element.address.toUpperCase().includes('QUẢNG NINH')) {
        objData.quangNinh += 1
        objData.tong += 1
      } else if (element.address.toUpperCase().includes('HÀ NỘI')) {
        objData.haNoi += 1
        objData.tong += 1
      } else {
        objData.khac += 1
        objData.tong += 1
      }
    })
    return objData
  }
  async statisticalMaintenanceFree() {
    const toDay = new Date()
    const project = await this.projectRepository.find({
      where: {
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: true,
        },
      },
      relations: ['historyMaintenance'],
    })
    const objData = {
      quangNinh: 0,
      haNoi: 0,
      khac: 0,
      tong: 0,
    }
    project.forEach((element) => {
      if (element.address.toUpperCase().includes('QUẢNG NINH')) {
        objData.quangNinh += 1
        objData.tong += 1
      } else if (element.address.toUpperCase().includes('HÀ NỘI')) {
        objData.haNoi += 1
        objData.tong += 1
      } else {
        objData.khac += 1
        objData.tong += 1
      }
    })

    return objData
  }
  async statisticalWarranty() {
    const toDay = new Date()
    const project = await this.projectRepository.find({
      where: {
        warrantyStart: LessThan(toDay),
        warrantyEnd: MoreThan(toDay),
      },
    })
    const objData = {
      quangNinh: 0,
      haNoi: 0,
      khac: 0,
      tong: 0,
    }
    project.forEach((element) => {
      if (element.address.toUpperCase().includes('QUẢNG NINH')) {
        objData.quangNinh += 1
        objData.tong += 1
      } else if (element.address.toUpperCase().includes('HÀ NỘI')) {
        objData.haNoi += 1
        objData.tong += 1
      } else {
        objData.khac += 1
        objData.tong += 1
      }
    })
    return objData
  }

  async findAllProject() {
    const project = await this.projectRepository.find({
      relations: ['historyMaintenance'],
    })
    return project
  }

  async countProjectByMonth() {
    const projects = await this.projectRepository.find()
    // Đếm số lượng dự án và tính tổng giá trị (price - tax) theo tháng
    const monthlyCount = {}
    projects.forEach((project) => {
      const month = new Date(project.createdAt).getMonth() + 1 // Tháng bắt đầu từ 0 nên cần cộng thêm 1
      const year = new Date(project.createdAt).getFullYear()
      const key = `${year}-${month}`
      // Tính tổng (price - tax) cho dự án
      const price = Number(project.price) // Chắc chắn là số, chuyển từ chuỗi nếu cần
      const tax = Number(project.tax) // Chắc chắn là số, chuyển từ chuỗi nếu cần
      const totalValue = price - tax
      if (monthlyCount[key]) {
        monthlyCount[key].count++
        monthlyCount[key].totalValue += totalValue // Cộng dồn tổng giá trị cho tháng
      } else {
        monthlyCount[key] = {
          count: 1, // Số lượng dự án
          totalValue: totalValue, // Tổng giá trị (price - tax)
        }
      }
    })
    // Chuyển kết quả thành mảng và sắp xếp theo tháng/năm
    const result = Object.keys(monthlyCount).map((key) => {
      const [year, month] = key.split('-')
      return {
        year: parseInt(year),
        month: parseInt(month),
        count: monthlyCount[key].count,
        totalValue: monthlyCount[key].totalValue, // Thêm tổng giá trị vào kết quả
      }
    })
    result.sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month
      }
      return a.year - b.year
    })
    return result
  }
  async countProjectByMonthByBusines(idStaff: number) {
    const projects = await this.projectRepository.find({
      where: {
        projectStaff: {
          staff: {
            id: idStaff,
          },
        },
      },
    })
    const monthlyCount = {}
    projects.forEach((project) => {
      const month = new Date(project.createdAt).getMonth() + 1 // Tháng bắt đầu từ 0 nên cần cộng thêm 1
      const year = new Date(project.createdAt).getFullYear()
      const key = `${year}-${month}`
      // Tính tổng (price - tax) cho dự án
      const price = Number(project.price) // Chắc chắn là số, chuyển từ chuỗi nếu cần
      const tax = Number(project.tax) // Chắc chắn là số, chuyển từ chuỗi nếu cần
      const totalValue = price - tax
      if (monthlyCount[key]) {
        monthlyCount[key].count++
        monthlyCount[key].totalValue += totalValue // Cộng dồn tổng giá trị cho tháng
      } else {
        monthlyCount[key] = {
          count: 1, // Số lượng dự án
          totalValue: totalValue, // Tổng giá trị (price - tax)
        }
      }
    })
    // Chuyển kết quả thành mảng và sắp xếp theo tháng/năm
    const result = Object.keys(monthlyCount).map((key) => {
      const [year, month] = key.split('-')
      return {
        year: parseInt(year),
        month: parseInt(month),
        count: monthlyCount[key].count,
        totalValue: monthlyCount[key].totalValue, // Thêm tổng giá trị vào kết quả
      }
    })

    result.sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month
      }
      return a.year - b.year
    })

    return result
  }

  create(createProjectDto: CreateProjectDto) {
    try {
      return this.projectRepository.save({
        code_project: createProjectDto.code_project,
        full_name: createProjectDto.full_name,
        tax: createProjectDto.tax,
        price: createProjectDto.price,
        number_phone: createProjectDto.number_phone,
        email: createProjectDto.email,
        address: createProjectDto.address,
        infor_product: createProjectDto.infor_product,
      })
    } catch (error) {
      console.log('🔴 ~ file: project.service.ts ~ line 116 ~ ProjectService ~ create ~ error', error)
    }
  }
  createProjectMaintenance(createProjectMaintenanceDto: CreateProjectMaintenanceDto) {
    try {
      return this.projectRepository.save({
        code_project: createProjectMaintenanceDto.code_project,
        full_name: createProjectMaintenanceDto.full_name,
        tax: createProjectMaintenanceDto.tax,
        price: createProjectMaintenanceDto.price,
        number_phone: createProjectMaintenanceDto.number_phone,
        email: createProjectMaintenanceDto.email,
        address: createProjectMaintenanceDto.address,
        infor_product: createProjectMaintenanceDto.infor_product,
        type: 'BAOTRI',
      })
    } catch (error) {
      console.log('🔴 ~ file: project.service.ts ~ line 116 ~ ProjectService ~ create ~ error', error)
    }
  }
  findAll() {
    return this.projectRepository.find({
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff'],
    })
  }
  findAllByBusines(idStaff: number) {
    return this.projectRepository.find({
      where: {
        projectStaff: {
          staff: {
            id: idStaff,
          },
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff'],
    })
  }

  findAllStatus(status: number) {
    if (status == 2) {
      return this.projectRepository.find({
        where: { type: 'LAPDAT' },
        relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff'],
      })
    } else {
      return this.projectRepository.find({
        where: { status, type: 'LAPDAT' },
        relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff'],
      })
    }
  }

  findAllProjectsMaintenanceFree() {
    const toDay = new Date()
    return this.projectRepository.find({
      where: {
        type: 'BAOTRI',
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: true,
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff', 'historyMaintenance'],
    })
  }

  findAllProjectsMaintennce() {
    const toDay = new Date();
    return this.projectRepository.find({
      where: {
        type: 'BAOTRI',
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: false,
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff', 'historyMaintenance'],
    })
  }

  findByStaffId(staffId: number, status: number) {
    if (status == 2) {
      return this.projectRepository.find({
        where: {
          type: 'LAPDAT',
          projectStaff: {
            staff: {
              id: staffId,
            },
          },
        },
        relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff'],
      })
    } else {
      return this.projectRepository.find({
        where: {
          type: 'LAPDAT',
          projectStaff: {
            staff: {
              id: staffId,
            },
          },
          status,
        },
        relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff'],
      })
    }
  }
  findProjectsMaintenanceFreeByStaffId(staffId: number) {
    const toDay = new Date()
    return this.projectRepository.find({
      where: {
        type: 'BAOTRI',
        projectStaff: {
          staff: {
            id: staffId,
          },
        },
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: true,
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff', 'historyMaintenance'],
    })
  }

  findProjectsMaintennceByStaffId(staffId: number) {
    const toDay = new Date();
    return this.projectRepository.find({
      where: {
        type: 'BAOTRI',
        projectStaff: {
          staff: {
            id: staffId,
          },
        },
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: false,
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff', 'historyMaintenance'],
    })
  }

  findAllAction() {
    return this.projectRepository.find({
      where: { status: 0 },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps'],
    })
  }
  findAlSuccess() {
    return this.projectRepository.find({
      where: { status: 1 },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps'],
    })
  }
  findOne(id: number) {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['projectStaff', 'projectStaff.staff'],
    })
  }
  update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.projectRepository.update(id, updateProjectDto)
  }
  async updateStatusProject(id: number) {
    return await this.projectRepository.update(id, { status: 1 })
  }
  remove(id: number) {
    return `This action removes a #${id} project`
  }

  async removeMaintenanceProject(id: number) {
    const historyMaintenances = await this.historyMaintenanceRepository.find({
      where: { project: { id } },
    });
    if (historyMaintenances.length > 0) {
      await this.historyMaintenanceRepository.softRemove(historyMaintenances);
    }
    return this.projectRepository.softDelete(id);
  }
}
