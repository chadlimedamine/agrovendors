import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { AddPhoneNumberDto } from './dto';
import { PhoneNumbersService } from './phone-numbers.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Phone Numbers')
@Controller('phone-numbers')
export class PhoneNumbersController {
    constructor(private phoneNumbersService: PhoneNumbersService) {}

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'User not found'})
    @ApiConflictResponse({description: 'Phone number already exists'})
    @UseGuards(JwtGuard)
    @Post('me')
    async addPhoneNumberToMyself(
        @Body() addPhoneNumberDto: AddPhoneNumberDto,
        @GetUser('id') currentUserId: number,
    ) {
        return await this.phoneNumbersService.addPhoneNumberToMyself(currentUserId, addPhoneNumberDto);
    }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'User not found'})
    @UseGuards(JwtGuard)
    @Get('me')
    async getMyPhoneNumbers(
        @GetUser('id') currentUserId: number,
    ) {
        return await this.phoneNumbersService.getMyPhoneNumbers(currentUserId);
    }

    @ApiInternalServerErrorResponse()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse({description: 'User or phone number not found'})
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
