import {Injectable, NestMiddleware} from '@nestjs/common'
import {Request, Response, NextFunction} from 'express'
import {StaffsService} from './staffs/staffs.service'
import {NotificationService} from './notification/notification.service'
import {PermisionService} from './permision/permision.service'

@Injectable()
export class GlobalVariablesMiddleware implements NestMiddleware {
  constructor (
    private readonly staffsService: StaffsService,
    private readonly notificationService: NotificationService,
    private readonly permisionService: PermisionService,
  ) {}

  async use (req: Request, res: Response, next: NextFunction) {
    res.locals.activeMenu = ''; // Default for EJS views
    if (req.path === '/login') {
      return next()
    }
        const token = req.cookies['token']
      if (token) {
        const payload = await this.staffsService.payload(token)
        res.locals.permisionArr = await this.permisionService.finByStaff(+payload.id)
        res.locals.fullNameLocal = payload.full_name
        res.locals.avatarLocal = payload.avatar
        res.locals.emailLocal = payload.email
        res.locals.role_admin = payload.role_admin
        res.locals.manager = payload.manager
        res.locals.busines = payload.busines
        res.locals.id = payload.id
        res.locals.notifications = await this.notificationService.findNotificationMax6(payload.id)
        res.locals.countUnreadNotifications = await this.notificationService.countUnreadNotifications(payload.id)
        next()
      }else{
        next()
      }
  }
}
