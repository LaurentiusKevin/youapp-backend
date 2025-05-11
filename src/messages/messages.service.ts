import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SendMessageDto } from './dto/sendMessage.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Message') private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async updateUserClientId(username: string, clientId: string): Promise<void> {
    const user = await this.userModel.findOne({
      username: username,
    });

    if (!user) throw new NotFoundException(`Username ${username} not found.`);

    user.chatClientId = clientId;
    await user.save();
  }

  async unsignedUserClientId(clientId: string): Promise<void> {
    const user = await this.userModel.findOne({
      chatClientId: clientId,
    });

    if (user !== null) {
      user.chatClientId = undefined;
      await user.save();
    }
  }

  async sendMessage(user: UserDocument, sendMessageDto: SendMessageDto) {
    const receiver = await this.userModel.findOne({
      username: sendMessageDto.receiverUsername,
    });
    if (!receiver)
      throw new NotFoundException(
        `Username ${sendMessageDto.receiverUsername} not found.`,
      );

    const message = new this.messageModel({
      chatId: sendMessageDto.chatId || new Types.ObjectId(),
      sender: {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      receiver: {
        userId: receiver._id,
        username: receiver.username,
        email: receiver.email,
      },
      content: sendMessageDto.content,
    });

    return message.save();
  }

  async getMessageByChatId(chatId: Types.ObjectId) {
    return this.messageModel
      .find({
        chatId: chatId,
      })
      .sort({ createdAt: 1 });
  }

  async getMessageByUsername(username: string) {
    const user = await this.userModel.findOne({
      username: username,
    });

    if (!user) throw new NotFoundException(`User ${username} not found.`);

    const latestUserChat = await this.messageModel
      .find({
        $or: [
          { 'sender.username': user.username },
          { 'receiver.username': user.username },
        ],
      })
      .sort({ createdAt: 'asc' })
      .limit(1)
      .then((results) => results[0]);

    if (!latestUserChat) return null;

    const message = await this.getMessageByChatId(latestUserChat.chatId);

    return message;
  }
}
