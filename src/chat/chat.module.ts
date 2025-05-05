import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    JwtModule,
    MessagesModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
