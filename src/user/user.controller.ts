import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user.query.dto/user.query.dto';
import { Role } from 'src/auth/enum/role.enum';
import { RolesGuard } from 'src/auth/guard/index.';
import { PermissionsGuard } from 'src/authorization/permissions';
import { Permissions } from 'src/authorization/decorator';

@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@GetUser() user: User, @GetUser('phoneNumber') phoneNumber: string){
        return `phoneNumber: ${phoneNumber} and user info: ${JSON.stringify(user)}`;
    }
    
    @Roles(Role.SuperAdmin)
    @UseGuards(JwtGuard, RolesGuard)
    @Get()
    getUsers(@Query() query: UserQueryDto){
            
        return this.userService.getUsers(query.filterOn, query.filterQuery, 
                                        query.sortOn, query.isAscending ?? true,
                                        query.pageNumber ?? 1, query.pageSize ?? 10);
    }

    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions('read:userById')
    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number){
        return this.userService.getUserById(id);
    }

    @Roles(Role.SuperAdmin)
    @UseGuards(JwtGuard, RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteUserByid(@Param('id', ParseIntPipe) id: number){
        return this.userService.deleteUser(id);
    }
}
