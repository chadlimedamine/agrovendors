import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean {
    // get the request
    const [req] = context.getArgs();

    // get te user permissions
    const userPermissions = req?.user?.permissions || [];

    // get the required permissions from the metadata
    const requiredPermissions = this.reflector
                                    .get('permissions', context.getHandler()) || [];

    // check if the user has all the required permissions
    const hasAllRequiredPermissions = requiredPermissions
                                      .every(permission => 
                                              userPermissions.includes(permission));

    if (requiredPermissions ===  0 || hasAllRequiredPermissions){
      return true;
    }
    
    throw new ForbiddenException('Insuffient permissions!');
  }
}
