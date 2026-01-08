import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class ResponseValidationInterceptor<T extends object>
  implements NestInterceptor<any, T>
{
  constructor(private readonly dto: new () => T) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      switchMap(async (data) => {
        if (data === null) {
          return null;
        }
        const transformedData = plainToInstance(
          this.dto,
          data,
          {
            enableImplicitConversion: true,
            excludeExtraneousValues: true,

          },
        );
        const errors = await validate(transformedData,
          {
            whitelist: true,
            forbidNonWhitelisted: false,
            skipMissingProperties: true,
            skipUndefinedProperties: true,
          });
        if (process.env.NODE_ENV === 'development') {
          console.info('errors', errors);
        }

        if (errors.length > 0) {
          const logValidationErrors = (errs: any[], path: string = '') => {
            for (const err of errs) {
              const propertyPath = path ? `${path}.${err.property}` : err.property;
              if (err.constraints) {
                console.error(`Validation error at "${propertyPath}":`, err.constraints);
              }
              if (err.children && err.children.length > 0) {
                logValidationErrors(err.children, propertyPath);
              }
              // Special case: array of nested classes
              if (Array.isArray(err.value) && err.children && err.children.length > 0) {
                err.children.forEach((child: any, idx: number) => {
                  if (child.constraints || (child.children && child.children.length > 0)) {
                    logValidationErrors([child], `${propertyPath}[${idx}]`);
                  }
                });
              }
            }
          };
          logValidationErrors(errors);
        }

        return instanceToPlain(transformedData) as T;
      })
    );
  }
}
