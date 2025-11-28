import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendImageDto {
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    @IsOptional()
    caption?: string;

    @IsString()
    @IsOptional()
    conversationId?: string;

    @IsString()
    @IsOptional()
    contactNumber?: string;
}
