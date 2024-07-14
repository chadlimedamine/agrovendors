import { IsNotEmpty, IsString } from "class-validator";

export class AuthSigninDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
