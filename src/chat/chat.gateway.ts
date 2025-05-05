import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { SendMessageDto } from '../messages/dto/sendMessage.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseGuards } from '@nestjs/common';
import { Error, Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { jwtConstants } from '../auth/constants';
import { InjectModel } from '@nestjs/mongoose';

interface SocketWithUser extends Socket {
  user?: User;
}

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @UseGuards(JwtAuthGuard)
  async handleConnection(client: SocketWithUser) {
    try {
      const token = client.handshake.headers['x-access-token'] as string;
      const user = this.jwtService.verify<User>(token, {
        secret: jwtConstants.secret,
      });
      client.user = user;

      await this.messagesService.updateUserClientId(user.username, client.id);

      this.logger.log(`User ${user.username} connected: ${client.id}`);
    } catch (err) {
      const error = err as Error;

      this.logger.error(`ChatGateway - handleConnection: ${error.message}`);
      client.emit('error_message', {
        message: 'Failed to send message',
        error: error.message,
      });
      client.disconnect();
      return { status: 'error', details: error.message };
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.messagesService.unsignedUserClientId(client.id);
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(chatId);
    client.emit('joined_chat', { chatId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    const token = client.handshake.headers['x-access-token'] as string;
    try {
      const extractedToken = this.jwtService.verify<User>(token, {
        secret: jwtConstants.secret,
      });
      const sender: User | null = await this.userModel.findOne({
        username: extractedToken.username,
      });
      if (!sender) {
        client.emit('error_message', {
          message: 'Failed to send message sender not found!',
        });
        client.disconnect();
        this.logger.warn(
          `Failed to send message sender not found: ${client.id}`,
        );

        return {
          status: 'error_message',
          message: 'Failed to send message sender not found!',
        };
      }

      const receiver: User | null = await this.userModel.findOne({
        username: sendMessageDto.receiverUsername,
      });
      if (!receiver) {
        client.emit('error_message', {
          message: 'Failed to send message receiver not found!',
        });
        this.logger.warn(
          `Failed to send message receiver not found: ${client.id}`,
        );

        return {
          status: 'error',
          message: 'Failed to send message receiver not found!',
        };
      }

      const message = await this.messagesService.sendMessage(
        sender,
        sendMessageDto,
      );

      if (typeof sendMessageDto.chatId === 'undefined') {
        client.emit('chat_created', {
          message: 'Successfully create new chat',
          data: message,
        });
        this.logger.log(
          `Successfully create new chat ${sender.username} <--> ${receiver.username}`,
        );
      }

      const messages = await this.messagesService.getMessageByChatId(
        message.chatId!,
      );

      client.emit('message_data', messages);

      if (typeof receiver.chatClientId !== 'undefined') {
        this.server.to(receiver.chatClientId).emit('message_data', messages);
      }

      return { status: 'success', message };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to send message ${client.id}: ${err.message}`);
      client.emit('error_message', {
        message: 'Failed to send message',
        error: err.message,
      });
      return { status: 'error', details: err.message };
    }
  }
}
