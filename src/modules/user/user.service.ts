import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    create(data: CreateUserDto) {
        const user = this.userRepository.create(data)
        return this.userRepository.save(user)
    }

    findAll() {
        return this.userRepository.find()
    }

    findOne(id: string) {
        return this.userRepository.findOneBy({ id })
    }

    findOneByEmail(email: string) {
        return this.userRepository.findOneBy({ email })
    }

    async update(id: string, data: UpdateUserDto) {
        const user = await this.findOne(id)

        if (!user) {
            throw new NotFoundException()
        }

        Object.assign(user, data)
        return this.userRepository.save(user)
    }

    async remove(id: string) {
        const user = await this.findOne(id)

        if (!user) {
            throw new NotFoundException()
        }

        this.userRepository.remove(user)
    }
}
