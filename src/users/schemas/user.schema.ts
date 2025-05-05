import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  chatClientId?: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop()
  gender: string;

  @Prop()
  birthday: Date;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop([String])
  interests: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
