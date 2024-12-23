import { IsOptional, IsString } from 'class-validator'

export class CreateWalletDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string
}
