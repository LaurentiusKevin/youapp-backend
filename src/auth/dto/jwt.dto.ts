import { IsEmail, IsString } from 'class-validator';

export class JwtDto {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;
}
