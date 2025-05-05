import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  birthday: Date;

  @ApiProperty()
  @IsEnum(['male', 'female'])
  gender: string;

  @ApiProperty()
  @IsNumber()
  height: number;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  interests: string[];
}
