import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common'
import {Response} from 'express'
import {QueryFailedError} from 'typeorm'

@Catch(HttpException, QueryFailedError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()
    // ❗ Tránh gửi response nếu đã gửi
    if (response.headersSent) {
      return
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'An error occurred'
    let error = 'Error'
    let validationErrors: any = null

    if (exception instanceof QueryFailedError) {
      // Lỗi database
      if (exception.message.includes('Duplicate entry')) {
        status = HttpStatus.BAD_REQUEST
        message = 'Duplicate entry error'
        error = 'Bad Request'
        validationErrors = exception.message
      }
    } else {
      // Lỗi HTTP bình thường
      status = exception.getStatus()
      if (exception instanceof ForbiddenException) {
        message = "You don't have permission to access this resource."
        error = 'Forbidden'
      } else if (exception instanceof NotFoundException) {
        message = 'Resource not found'
        error = 'Not Found'
      } else if (exception instanceof BadRequestException) {
        message = 'Bad request'
        error = 'Bad Request'
        const responseBody = exception.getResponse()
        if (typeof responseBody === 'object' && 'message' in responseBody) {
          validationErrors = (responseBody as any)['message']
        }
        try {
          require('fs').appendFileSync('debug_400_errors.log', new Date().toISOString() + ' | URL: ' + request.url + ' | ERRORS: ' + JSON.stringify(validationErrors) + '\n');
        } catch (e) {}
      } else if (exception instanceof InternalServerErrorException) {
        message = 'Internal server error'
        error = 'Internal Server Error'
      }
    }

    if (!validationErrors) {
      validationErrors = ['Vui lòng kiểm tra lại dữ liệu', 'Please check your data']
    }
    // Xử lý phản hồi HTML hoặc JSON
    if (request.accepts('html')) {
      response.status(status).render('err/' + status.toString(), {
        message,
        validationErrors,
      })
    } else {
      response.status(status).json({
        statusCode: status,
        message,
        error,
        validationErrors,
      })
    }
  }
}
