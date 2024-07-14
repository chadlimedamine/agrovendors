import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPhoneNumberDto } from './dto';

@Injectable()
export class PhoneNumbersService {
    constructor(private prismaService: PrismaService) {}

    async addPhoneNumberToMyself(
        currentUserId: number, 
        addPhoneNumberDto: AddPhoneNumberDto
    ) {
        const user = await this.prismaService.user.findUnique(
            {
                where: {
                    id: currentUserId
                }
            }
        );

        if (!user)
            throw new NotFoundException('User not found!');

        const createdPhoneNumber = await this.prismaService.phone.create(
            {
                data: {
                    phoneNumber: addPhoneNumberDto.phoneNumber,
                    userId: currentUserId,
                }
            }
        );

        return createdPhoneNumber;
    }

    async getMyPhoneNumbers(
        currentUserId: number
    ) {
        const user = await this.prismaService.user.findUnique(
            {
                where: {
                    id: currentUserId
                }
            }
        );

        if (!user)
            throw new NotFoundException('User not found!');

        const myPhoneNumbers = await this.prismaService.phone.findMany(
            {
                where: {
                    userId: currentUserId
                }
            }
        );

        return myPhoneNumbers;
    }

    async deleteMyPhoneNumberById(
        currentUserId: number,
        phoneId: number
    ) {
        const user = await this.prismaService.user.findUnique(
            {
                where: {
                    id: currentUserId
                }
            }
        );

        if (!user)
            throw new NotFoundException('User not found!');

        const phone = await this.prismaService.phone.findUnique(
            {
                where: {
                    id: phoneId
                }
            }
        );

        if (!phone)
            throw new NotFoundException("phone number doesn't exist");

        const deletedPhone = await this.prismaService.phone.delete(
            {
                where: {
                    id: phoneId
                }
            }
        );
        
        return deletedPhone;
    }
}
