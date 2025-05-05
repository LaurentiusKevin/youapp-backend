import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Error, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    try {
      const isExists = await this.userModel.findOne({
        or: [{ username: registerDto.username }, { email: registerDto.email }],
      });

      if (isExists)
        throw new NotAcceptableException('Username or Email already exists');

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = new this.userModel({
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
      });

      return user.save();
    } catch (error: unknown) {
      const err = error as Error;
      throw new InternalServerErrorException(err.message);
    }
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({
      username: username,
    });
    if (!user) throw new UnauthorizedException();

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new UnauthorizedException();

    return user;
  }

  login(user: User): string {
    try {
      return this.jwtService.sign({
        username: user.username,
        email: user.email,
      });
    } catch (error: unknown) {
      const err = error as Error;
      throw new InternalServerErrorException(err.message);
    }
  }

  async validateJwtUser(username: string, email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      username: username,
      email: email,
    });
    if (!user) {
      return null;
    }

    return user;
  }
}
