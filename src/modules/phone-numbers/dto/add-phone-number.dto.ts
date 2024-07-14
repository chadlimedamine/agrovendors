
import {IsNotEmpty, IsString } from "class-validator";

export class AddPhoneNumberDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}
