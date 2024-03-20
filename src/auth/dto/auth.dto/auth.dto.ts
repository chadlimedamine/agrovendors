import { IsEmail, IsNotEmpty, IsString, isString } from "class-validator";

export class AuthSignupDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
