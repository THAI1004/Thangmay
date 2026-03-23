import {NestFactory} from '@nestjs/core'
import {NestExpressApplication} from '@nestjs/platform-express'
import {join} from 'path'
import {AppModule} from './app.module'
import {ValidationPipe} from '@nestjs/common'
import * as session from 'express-session'
import * as flash from 'connect-flash'
import * as methodOverride from 'method-override'
import * as cookieParser from 'cookie-parser'
import {HttpExceptionFilter} from './common/filters/http-exception.filter'
// testgit
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('ejs')
  app.useGlobalFilters(new HttpExceptionFilter())

  // ✅ Phải có session TRƯỚC flash
  app.use(
    session({
      secret: 'keyboard cat', // đổi thành chuỗi bí mật của bạn
      resave: false,
      saveUninitialized: false,
    }),
  )

  // ✅ Sau đó mới flash
  app.use(flash())

  // ✅ Gán flash vào res.locals để EJS dùng được
  app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
  })

  app.use(cookieParser())
  app.use(methodOverride('_method'))

  await app.listen(3000)
}
bootstrap()
