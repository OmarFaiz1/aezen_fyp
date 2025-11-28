import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    conversationId?: string;

    @IsString()
    @IsOptional()
    contactNumber?: string; // For starting a new conversation
}
