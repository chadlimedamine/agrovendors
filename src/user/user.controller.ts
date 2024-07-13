import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user.query.dto/user.query.dto';
import { PermissionsGuard } from 'src/authorization/permissions';
import { Permissions } from 'src/authorization/decorator';
import {Permission} from '@prisma/client';

@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@GetUser() user){
        return this.userService.getAuthenticatedUser(user);
    }
    
    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions(Permission.ReadUsers)
    @Get()
    getUsers(@Query() query: UserQueryDto){
            
        return this.userService.getUsers(query.filterOn, query.filterQuery, 
                                        query.sortOn, query.isAscending ?? true,
                                        query.pageNumber ?? 1, query.pageSize ?? 10);
    }

    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions(Permission.ReadUserById)
    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number){
        return this.userService.getUserById(id);
    }

    @UseGuards(JwtGuard, PermissionsGuard)
    @Permissions(Permission.DeleteUserByid)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteUserByid(@Param('id', ParseIntPipe) id: number){
        return this.userService.deleteUser(id);
    }
}
