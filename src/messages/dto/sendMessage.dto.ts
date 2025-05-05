import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  receiverUsername: string;

  @ApiProperty()
  @IsString()
  chatId: Types.ObjectId;
}
