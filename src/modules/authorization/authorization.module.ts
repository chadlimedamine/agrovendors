import { Module } from '@nestjs/common';
import { PermissionsGuard } from './permissions';

@Module({
    providers: [PermissionsGuard]
})
export class AuthorizationModule {}
