import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt'

const mockCredentialsDto = {
  username: 'TestUserName',
  password: 'Password123',
};
describe('User Repository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('Sign Up', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('succesfully signs up user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('throws conflict exception if username exist', () => {
      save.mockRejectedValue({ code: '23505' });
      return expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws internal server exception', () => {
      save.mockRejectedValue({ code: '12345' });
      return expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validate User password', () => {
    let user;
    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'TestUserName';
      user.validatePassword = jest.fn();
    });
    it('validates user password ', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true)
      expect(await userRepository.validateUserPassword(mockCredentialsDto)).toEqual(user.username);
    });

    it('return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null)
      const result = await userRepository.validateUserPassword(mockCredentialsDto)
      expect(user.validatePassword).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('return null when password invalid', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(false)
      const result = await userRepository.validateUserPassword(mockCredentialsDto)
      expect(user.validatePassword).toHaveBeenCalled()
      expect(result).toBeNull()
    })
  });

  describe('hash password', () => {
    it('calls bcrypt.hash and returns hash ', async () => {
      (bcrypt.hash as any) = jest.fn().mockResolvedValue('testhash')
      expect(bcrypt.hash).not.toHaveBeenCalled()
      const result = await userRepository.hashPassword('testPassword', 'testSalt')
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt')
      expect(result).toEqual('testhash')
      
    })
  })
});
