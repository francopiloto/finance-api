import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'

import { User } from '@modules/user/entities/user.entity'

@Entity()
@Unique(['user', 'appId'])
export class Token {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User, { nullable: false })
    user: User

    @Column()
    appId: string
}
