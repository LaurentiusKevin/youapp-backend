import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from './schemas/user.schema';
import { successResponse } from '../common/helpers/response.helper';
import { CreateProfileDto } from './dto/createProfile.dto';

@ApiTags('users')
@ApiHeaders([{ name: 'x-access-token', description: 'Access Token' }])
@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Profile has been found',
  })
  @Get('getProfile')
  async getProfile(@Req() req: Request) {
    const user = req.user as User;
    const profile = await this.usersService.profile(user.username);

    return successResponse('Profile has been found', {
      username: profile.username,
      email: profile.email,
      name: profile.name,
      birthday: profile.birthday,
      height: profile.height,
      weight: profile.weight,
      interests: profile.interests,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Username fetched successfully',
  })
  @Get('getAvailableUsernames')
  async getAvailableUsernames() {
    const usernames = await this.usersService.getAvailableUsernames();

    return successResponse('Username fetched successfully', usernames);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Profile has been created',
  })
  @Post('createProfile')
  async createProfile(
    @Req() req: Request,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const user = req.user as User;
    const profile = await this.usersService.createProfile(
      user.username,
      createProfileDto,
    );

    return successResponse('Profile has been created', {
      username: profile.username,
      email: profile.email,
      name: profile.name,
      birthday: profile.birthday,
      height: profile.height,
      weight: profile.weight,
      interests: profile.interests,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Profile has been updated',
  })
  @Put('updateProfile')
  async updateProfile(
    @Req() req: Request,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const user = req.user as User;
    const profile = await this.usersService.updateProfile(
      user.username,
      createProfileDto,
    );

    return successResponse('Profile has been updated', {
      username: profile.username,
      email: profile.email,
      name: profile.name,
      birthday: profile.birthday,
      height: profile.height,
      weight: profile.weight,
      interests: profile.interests,
    });
  }
}
