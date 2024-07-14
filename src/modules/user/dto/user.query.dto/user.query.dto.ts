import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class UserQueryDto {
    @IsOptional()
    @IsString()
    filterOn: string;

    @IsOptional()
    @IsString()
    filterQuery: string;

    @IsOptional()
    @IsString()
    sortOn: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isAscending: boolean;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageNumber: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageSize: number;
}
