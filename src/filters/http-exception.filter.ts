import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from 'src/logging/logging.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logging: LoggingService){}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    let message: string | unknown = exception.message;
    const exceptionResponse: string | object = exception.getResponse();
    if (typeof exceptionResponse === 'object') {
      if ('message' in  exceptionResponse) {
        message = exceptionResponse.message;
      }
    }
    const error = exception.name;

    // log the 500 status code caught exception
    if (status === 500)
      this.logging.globalLog('log error of internal server error', exception);

    response
    .status(status)
    .json({
      message: message,
      error: error,
      statusCode: status,
    });

    // response
    //   .status(status)
    //   .json({
    //     statusCode: status,
    //     timestamp: new Date().toISOString(),
    //     path: request.url,
    //   });
  }
}