import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { User } from '@modules/user/entities/user.entity'

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true })
    description?: string

    @ManyToOne(() => User, { nullable: false })
    user: User
}
