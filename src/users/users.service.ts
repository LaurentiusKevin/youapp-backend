import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Error, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CreateProfileDto } from './dto/createProfile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async profile(username: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({
        username: username,
      });

      if (!user) throw new InternalServerErrorException('User not found');

      return user;
    } catch (error: unknown) {
      const err = error as Error;
      throw new InternalServerErrorException(err.message);
    }
  }

  async createProfile(username: string, profile: CreateProfileDto) {
    const user = await this.userModel.findOne({
      username: username,
    });

    if (!user) throw new InternalServerErrorException('User not found');

    const profileKey = ['name', 'birthday', 'height', 'weight', 'interests'];
    if (profileKey.every((key) => user[key])) {
      throw new NotAcceptableException('Profile already exists');
    }

    user.name = profile.name;
    user.birthday = profile.birthday;
    user.gender = profile.gender;
    user.height = profile.height;
    user.weight = profile.weight;
    user.interests = profile.interests;
    await user.save();

    return user;
  }

  async updateProfile(username: string, profile: CreateProfileDto) {
    const user = await this.userModel.findOne({
      username: username,
    });

    if (!user) throw new InternalServerErrorException('User not found');

    user.name = profile.name;
    user.birthday = profile.birthday;
    user.gender = profile.gender;
    user.height = profile.height;
    user.weight = profile.weight;
    user.interests = profile.interests;
    await user.save();

    return user;
  }

  async getAvailableUsernames() {
    const users = await this.userModel.find().sort({ username: 'asc' });

    return users.map((user) => user.username);
  }
}
