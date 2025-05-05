import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
class UserInfo {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;
}

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  sender: UserInfo;

  @Prop({ required: true })
  receiver: UserInfo;

  @Prop()
  chatId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop()
  readAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
