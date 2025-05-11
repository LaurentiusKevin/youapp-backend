import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/sendMessage.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Request } from 'express';
import { successResponse } from '../common/helpers/response.helper';

@ApiTags('messages')
@ApiHeaders([{ name: 'x-access-token', description: 'Access Token' }])
@Controller('api')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully.',
  })
  @Post('sendMessage')
  async sendMessage(
    @Req() req: Request,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const user = req.user as UserDocument;
    const message = await this.messagesService.sendMessage(
      user,
      sendMessageDto,
    );

    return successResponse('Message sent successfully.', message);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Message fetched successfully.',
  })
  @Get('viewMessages')
  async viewMessages(@Req() req: Request) {
    const user = req.user as User;
    const messages = await this.messagesService.getMessageByUsername(
      user.username,
    );

    return successResponse('Message fetched successfully.', messages);
  }
}
