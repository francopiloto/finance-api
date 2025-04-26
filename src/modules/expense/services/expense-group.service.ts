import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { CreateExpenseGroupDto } from '../dtos/create-expense-group.dto';
import { UpdateExpenseGroupDto } from '../dtos/update-expense-group.dto';
import { ExpenseGroup } from '../entities/expense-group.entity';
import { Expense } from '../entities/expense.entity';

@Injectable()
export class ExpenseGroupService {
  constructor(
    @InjectRepository(ExpenseGroup)
    private readonly groupRepo: Repository<ExpenseGroup>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  findAll(user: User): Promise<ExpenseGroup[]> {
    return this.groupRepo
      .createQueryBuilder('group')
      .where('group.created_by = :userId', { userId: user.id })
      .orWhere('group.created_by IS NULL')
      .orderBy('group.name', 'ASC')
      .getMany();
  }

  async findById(user: User, id: string): Promise<ExpenseGroup> {
    const group =
      user && id ? await this.groupRepo.findOne({ where: { id, createdBy: user } }) : null;

    if (!group) {
      throw new NotFoundException('Expense Group not found');
    }

    return group;
  }

  create(user: User, data: CreateExpenseGroupDto): Promise<ExpenseGroup> {
    const group = this.groupRepo.create({ ...data, createdBy: user });
    return this.groupRepo.save(group);
  }

  async update(user: User, id: string, data: UpdateExpenseGroupDto): Promise<ExpenseGroup> {
    const group = await this.findById(user, id);
    Object.assign(group, data);

    return this.groupRepo.save(group);
  }

  async remove(user: User, id: string): Promise<ExpenseGroup> {
    const group = await this.findById(user, id);
    const hasExpense = await this.expenseRepo.findOne({ where: { group }, select: ['id'] });

    if (hasExpense) {
      throw new ConflictException('Cannot delete group with associated expenses');
    }

    return await this.groupRepo.remove(group);
  }
}
