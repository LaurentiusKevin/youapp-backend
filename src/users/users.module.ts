import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret', // store securely
      signOptions: { expiresIn: '2h' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
