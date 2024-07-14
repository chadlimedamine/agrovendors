import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOfferDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}
