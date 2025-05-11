import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';
import { NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CreateProfileDto } from './dto/createProfile.dto';

const mockUser = {
  _id: 'this is user id' as unknown as Types.ObjectId,
  username: 'laurentius',
  password: 'hashed password',
  email: 'laurent@mail.com',
  name: 'Laurentius Kevin',
  gender: 'M',
  birthday: new Date('1990-01-01'),
  height: 170,
  weight: 70,
  interests: ['new language framework', 'music', 'gaming'],
};

const mockUserModel = {
  findOne: jest.fn(),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([mockUser]),
  }),
};

const mockSave = jest.fn();

function MockUserModel(this: any, data: any) {
  Object.assign(this, data);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  this.save = mockSave;
}

MockUserModel.findOne = mockUserModel.findOne;
MockUserModel.find = mockUserModel.find;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('this-is-a-very-long-random-string'),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the profile', async () => {
      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(mockUser);

      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual({
        message: 'Profile has been found',
        data: {
          username: mockUser.username,
          email: mockUser.email,
          name: mockUser.name,
          birthday: mockUser.birthday,
          height: mockUser.height,
          weight: mockUser.weight,
          interests: mockUser.interests,
        },
      });
    });

    it('should throw NotAcceptableException if user not found', async () => {
      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);

      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(
        NotAcceptableException,
      );
    });
  });

  describe('createProfile', () => {
    it('should successfully create a profile', async () => {
      const mockNewUser = {
        _id: 'this is user id' as unknown as Types.ObjectId,
        username: 'laurentius',
        password: 'hashed password',
        email: 'laurent@mail.com',
      };

      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockProfileRequest: CreateProfileDto = {
        name: mockUser.name,
        birthday: mockUser.birthday,
        gender: mockUser.gender,
        height: mockUser.height,
        weight: mockUser.weight,
        interests: mockUser.interests,
      };

      const mockSave = jest.fn().mockResolvedValue(mockUser);

      jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue({ ...mockNewUser, save: mockSave });

      const result = await controller.createProfile(
        mockRequest,
        mockProfileRequest,
      );

      expect(result).toEqual({
        message: 'Profile has been created',
        data: {
          username: mockUser.username,
          email: mockUser.email,
          name: mockUser.name,
          birthday: mockUser.birthday,
          height: mockUser.height,
          weight: mockUser.weight,
          interests: mockUser.interests,
        },
      });
    });

    it('should throw NotAcceptableException if the user is not found', async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockProfileRequest: CreateProfileDto = {
        name: mockUser.name,
        birthday: mockUser.birthday,
        gender: mockUser.gender,
        height: mockUser.height,
        weight: mockUser.weight,
        interests: mockUser.interests,
      };

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);

      await expect(
        controller.createProfile(mockRequest, mockProfileRequest),
      ).rejects.toThrow(NotAcceptableException);
    });

    it('should throw NotAcceptableException if profile is already created', async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockProfileRequest: CreateProfileDto = {
        name: mockUser.name,
        birthday: mockUser.birthday,
        gender: mockUser.gender,
        height: mockUser.height,
        weight: mockUser.weight,
        interests: mockUser.interests,
      };

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(mockUser);

      await expect(
        controller.createProfile(mockRequest, mockProfileRequest),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  describe('updateProfile', () => {
    it('should successfully update a profile', async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockProfileRequest: CreateProfileDto = {
        name: mockUser.name,
        birthday: mockUser.birthday,
        gender: mockUser.gender,
        height: mockUser.height,
        weight: mockUser.weight,
        interests: mockUser.interests,
      };

      const mockSave = jest.fn().mockResolvedValue(mockUser);

      jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValue({ ...mockUser, save: mockSave });

      const result = await controller.updateProfile(
        mockRequest,
        mockProfileRequest,
      );

      expect(result).toEqual({
        message: 'Profile has been updated',
        data: {
          username: mockUser.username,
          email: mockUser.email,
          name: mockUser.name,
          birthday: mockUser.birthday,
          height: mockUser.height,
          weight: mockUser.weight,
          interests: mockUser.interests,
        },
      });
    });

    it('should throw NotAcceptableException if user is not found', async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockProfileRequest: CreateProfileDto = {
        name: mockUser.name,
        birthday: mockUser.birthday,
        gender: mockUser.gender,
        height: mockUser.height,
        weight: mockUser.weight,
        interests: mockUser.interests,
      };

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);

      await expect(
        controller.updateProfile(mockRequest, mockProfileRequest),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  describe('getAvailableUsernames', () => {
    it('should return a list of usernames', async () => {
      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue([mockUser]);

      const result = await controller.getAvailableUsernames();

      expect(result).toEqual({
        message: 'Username fetched successfully',
        data: [mockUser.username],
      });
    });
  });
});
