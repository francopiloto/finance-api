import { IsOptional, IsString } from 'class-validator'

export class UpdateWalletDto {
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    description?: string
}
