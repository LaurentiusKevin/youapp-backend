import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpException, NotAcceptableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};
const mockSave = jest.fn();

function MockUserModel(this: any, data: any) {
  Object.assign(this, data);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  this.save = mockSave;
}

MockUserModel.findOne = mockUserModel.findOne;
MockUserModel.create = mockUserModel.create;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('this-is-a-very-long-random-string'),
};

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUser: User = {
  _id: 'this is user id' as unknown as Types.ObjectId,
  username: 'laurentius',
  password: 'hashed password',
  email: 'laurent@mail.com',
  name: 'Laurentius Kevin',
  gender: 'M',
  birthday: new Date('1990-01-01'),
  height: 170,
  weight: 70,
  interests: [],
};
const registerDto = {
  username: 'laurentius',
  email: 'other@mail.com',
  password: 'password',
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const mockLoginRequest = {
        username: 'laurentius',
        password: 'password',
      };

      const mockToken = 'this-is-a-very-long-random-string';

      const mockResponse = {
        message: 'User has been logged in successfully',
        access_token: mockToken,
      };

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(mockLoginRequest);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(mockJwtService, 'sign').mockReturnValue(mockToken);

      const result = await controller.login(mockLoginRequest);

      expect(result).toEqual(mockResponse);
    });

    it('should throw HttpException if password is not correct', async () => {
      const mockLoginRequest = {
        username: 'laurentius',
        password: 'password',
      };

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(mockLoginRequest);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(controller.login(mockLoginRequest)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('register', () => {
    it('should throw NotAcceptableException if user is already registered based on username and email', async () => {
      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(mockUser);

      await expect(controller.register(registerDto)).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should register a user successfully', async () => {
      const mockRegisterRequest = {
        username: 'laurentius',
        email: 'laurent@mail.com',
        password: 'password',
      };

      const mockResponse = {
        message: 'User has been created successfully',
        data: {},
      };

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(
        'this is generated hash string from password',
      );
      mockSave.mockResolvedValueOnce(mockUser);

      const result = await controller.register(mockRegisterRequest);

      expect(mockSave).toHaveBeenCalled();

      expect(result).toEqual(mockResponse);
    });
  });
});
