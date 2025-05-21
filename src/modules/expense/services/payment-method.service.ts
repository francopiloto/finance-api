import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';
import { fk } from '@utils/db';

import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { PaymentMethodResponseDto } from '../dtos/payment-method-response.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import { Installment } from '../entities/installment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentRepo: Repository<PaymentMethod>,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
  ) {}

  findAll(user: User): Promise<PaymentMethod[]> {
    return this.paymentRepo.find({ where: { user: fk(user) }, order: { name: 'ASC' } });
  }

  async findById(user: User, id: string): Promise<PaymentMethod> {
    const method =
      user && id ? await this.paymentRepo.findOne({ where: { user: fk(user), id } }) : null;

    if (!method) {
      throw new NotFoundException('Payment Method not found');
    }

    return method;
  }

  async create(user: User, data: CreatePaymentMethodDto): Promise<PaymentMethodResponseDto> {
    const method = this.paymentRepo.create({ ...data, user });
    const saved = await this.paymentRepo.save(method);

    return plainToInstance(PaymentMethodResponseDto, saved, { excludeExtraneousValues: true });
  }

  async update(user: User, id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const method = await this.findById(user, id);
    Object.assign(method, data);

    return this.paymentRepo.save(method);
  }

  async remove(user: User, id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findById(user, id);

    const hasInstallments = await this.installmentRepo.findOne({
      where: { paymentMethod: fk(paymentMethod) },
      select: ['id'],
    });

    if (hasInstallments) {
      throw new ConflictException('Cannot delete payment method with associated installments');
    }

    return this.paymentRepo.remove(paymentMethod);
  }
}
