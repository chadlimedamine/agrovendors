import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/modules/auth/decorator';
import { JwtGuard } from 'src/modules/auth/guard/jwt.guard';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user.query.dto/user.query.dto';
import { PermissionsGuard } from 'src/modules/authorization/permissions';
import { Permissions } from 'src/modules/authorization/decorator';
import {Permission} from '@prisma/client';

@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @UseGuards(JwtGuard)
    @Get('me')
    async getMe(@GetUser() user){
        return await this.userService.getAuthenticatedUser(user);
    }
    
    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions(Permission.ReadUsers)
    @Get()
    async getUsers(@Query() query: UserQueryDto){
            
        return await this.userService.getUsers(query.filterOn, query.filterQuery, 
                                        query.sortOn, query.isAscending ?? true,
                                        query.pageNumber ?? 1, query.pageSize ?? 10);
    }

    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions(Permission.ReadUserById)
    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number){
        return await this.userService.getUserById(id);
    }

    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions(Permission.DeleteUserByid)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteUserByid(@Param('id', ParseIntPipe) id: number){
        return await this.userService.deleteUser(id);
    }
}
