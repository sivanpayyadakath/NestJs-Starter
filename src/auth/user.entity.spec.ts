import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { mocked } from 'ts-jest/utils';

describe('user entity', () => {
  let user;

  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    (bcrypt.hash as any) = jest.fn();
  });

  describe('validate password', () => {

    it('returns true when password valid ', async () => {
      (bcrypt.hash as any) = jest.fn().mockReturnValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(true);
    });

    it('returns false when password invalid ', async () => {
      (bcrypt.hash as any) = jest.fn().mockReturnValue('wrongPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(false);
    });
  });
  
});
