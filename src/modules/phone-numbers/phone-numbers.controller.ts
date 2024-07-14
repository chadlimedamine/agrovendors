import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { AddPhoneNumberDto } from './dto';
import { PhoneNumbersService } from './phone-numbers.service';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('phone-numbers')
export class PhoneNumbersController {
    constructor(private phoneNumbersService: PhoneNumbersService) {}

    @UseGuards(JwtGuard)
    @Post('me')
    async addPhoneNumberToMyself(
        @Body() addPhoneNumberDto: AddPhoneNumberDto,
        @GetUser('id') currentUserId: number,
    ) {
        return await this.phoneNumbersService.addPhoneNumberToMyself(currentUserId, addPhoneNumberDto);
    }

    @UseGuards(JwtGuard)
    @Get('me')
    async getMyPhoneNumbers(
        @GetUser('id') currentUserId: number,
    ) {
        return await this.phoneNumbersService.getMyPhoneNumbers(currentUserId);
    }

    @UseGuards(JwtGuard)
    @Delete('me/:phoneId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMyPhoneNumberById(
        @GetUser('id') currentUserId: number,
        @Param('phoneId', ParseIntPipe) phoneId: number
    ) {
        return await this.phoneNumbersService.deleteMyPhoneNumberById(currentUserId, phoneId);
    }
}
