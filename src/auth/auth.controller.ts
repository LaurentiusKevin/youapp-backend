import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../common/helpers/response.helper';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User has been created successfully',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);

    return successResponse('User has been created successfully');
  }

  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User has been logged in',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
      );

      const token = this.authService.login(user);

      return {
        message: 'User has been logged in successfully',
        access_token: token,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
