import { Repository, EntityRepository } from 'typeorm'
import { User } from './user.entity'
import { AuthCredentialsDto } from './dto/auth-credentials.dto'
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;

        const user = new User()
        user.username = username
        user.password = password
        try {
            await user.save()        
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}