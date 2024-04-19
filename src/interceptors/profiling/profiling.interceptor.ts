import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { LoggingService } from 'src/logging/logging.service';

@Injectable()
export class ProfilingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService){}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    // start profiling
    const profiler = this.logger.startProfiling();

    // get the request
    const req = context.switchToHttp().getRequest();
    const url = req.url;
    const verb = req.method;
    const userId = req?.user?.id ?? 'Anonymous';
    const profilingContext = {userId, url, verb};

    return next
          .handle()
          .pipe(
            // the request response without 500 status code errors return the following 
            tap(() => profiler.done({...profilingContext, RequestSuccess: true}))
          )
          .pipe(
            catchError((error) => 
              throwError(() => {
                // if the request response is not an instance of HttpException then 
                // it is a 500 status code error and we will return RequestSuccess = false
                if (!(error instanceof HttpException))
                  profiler.done({...profilingContext, RequestSuccess: false});
                else
                  profiler.done({...profilingContext, RequestSuccess: true});
                // we will simply throw the error again
                throw error;
            })
            )
          );
  }
}
