import { Controller, Get, ParseBoolPipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user.query.dto/user.query.dto';

@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@GetUser() user: User, @GetUser('phoneNumber') phoneNumber: string){
        return `phoneNumber: ${phoneNumber} and user info: ${JSON.stringify(user)}`;
    }
    
    @Get()
    getUsers(@Query() query: UserQueryDto){
            
        return this.userService.getUsers(query.filterOn, query.filterQuery, 
                                        query.sortOn, query.isAscending ?? true,
                                        query.pageNumber ?? 1, query.pageSize ?? 10);
    }
}
