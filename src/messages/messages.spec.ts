import { MessagesController } from './messages.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { Request } from 'express';
import { MessagesService } from './messages.service';
import { NotFoundException } from '@nestjs/common';

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

const mockUser2 = {
  _id: 'this is second user id' as unknown as Types.ObjectId,
  username: 'kevin',
  password: 'hashed password',
  email: 'kevin@mail.com',
  name: 'Kevin',
  gender: 'M',
  birthday: new Date('1990-01-01'),
  height: 180,
  weight: 80,
  interests: ['new language framework', 'music', 'gaming'],
};

const mockNewMessageData = {
  chatId: 'this is chat id' as unknown as Types.ObjectId,
  sender: {
    userId: mockUser._id,
    username: mockUser.username,
    email: mockUser.email,
  },
  receiver: {
    userId: mockUser2._id,
    username: mockUser2.username,
    email: mockUser2.email,
  },
  content: 'Hello kevin, this is a mock content request',
};

const mockQuery = {
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue([mockNewMessageData]),
};

const mockModel = {
  findOne: jest.fn(),
  find: jest.fn().mockReturnValue(mockQuery),
};

const mockSave = jest.fn();

function MockUserModel(this: any, data: any) {
  Object.assign(this, data);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  this.save = mockSave;
}

MockUserModel.findOne = mockModel.findOne;
MockUserModel.find = mockModel.find;

function MockMessagesModel(this: any, data: any) {
  Object.assign(this, data);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  this.save = mockSave;
}

MockMessagesModel.findOne = mockModel.findOne;
MockMessagesModel.find = mockModel.find;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('this-is-a-very-long-random-string'),
};

describe('MessageController', () => {
  let controller: MessagesController;

  describe('sendMessage', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [MessagesController],
        providers: [
          MessagesService,
          { provide: getModelToken(User.name), useValue: MockUserModel },
          { provide: getModelToken(Message.name), useValue: MockMessagesModel },
          { provide: JwtService, useValue: mockJwtService },
        ],
      }).compile();

      mockModel.findOne.mockReset();

      controller = module.get<MessagesController>(MessagesController);

      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should successfully send message', async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockMessageRequest = {
        content: 'Hello kevin, this is a mock content request',
        receiverUsername: 'kevin',
        chatId: 'this is chat id' as unknown as Types.ObjectId,
      };

      jest.spyOn(mockModel, 'findOne').mockResolvedValue(mockUser2);

      jest.spyOn(mockModel, 'findOne').mockResolvedValue({
        ...mockNewMessageData,
        save: mockSave,
      });

      const result = await controller.sendMessage(
        mockRequest,
        mockMessageRequest,
      );

      expect(result).toEqual({
        message: 'Message sent successfully.',
        data: {},
      });
    });

    it('should throw NotFoundException if receiver is not found', async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const mockMessageRequest = {
        content: 'Hello kevin, this is a mock content request',
        receiverUsername: 'kevin',
        chatId: 'this is chat id' as unknown as Types.ObjectId,
      };

      jest.spyOn(mockModel, 'findOne').mockResolvedValue(null);

      await expect(
        controller.sendMessage(mockRequest, mockMessageRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
