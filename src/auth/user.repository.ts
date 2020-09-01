import { Repository, EntityRepository } from 'typeorm'
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity'
import { AuthCredentialsDto } from './dto/auth-credentials.dto'

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;
        
        const user = new User()
        user.username = username
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt)
        try {
            await user.save()        
        } catch (error) {
            console.log(error.message)
            if(error.code === '23505') {
                throw new ConflictException('dup name')
            } else {
                throw new InternalServerErrorException()
            }
        }
    }

    async hashPassword(password: string,salt: string): Promise<string> {
        return await bcrypt.hash(password, salt)
    }
}