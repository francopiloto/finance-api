import { Exclude } from 'class-transformer'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Wallet } from '@modules/wallet/entities/wallet.entity'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @OneToMany(() => Wallet, (wallet) => wallet.owner)
    wallets: Wallet[]

    @Column({ unique: true })
    email: string

    @Column()
    @Exclude()
    password: string
}
