import { MigrationInterface, QueryRunner } from 'typeorm';
import { uuidv7 } from 'uuidv7';

export class SeedGlobalExpenseGroups1746223537516 implements MigrationInterface {
  name = 'SeedGlobalExpenseGroups1746223537516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const names = [
      'Rent',
      'Groceries',
      'Electricity',
      'Water',
      'Gas',
      'Internet',
      'Phone',
      'Healthcare',
      'Education',
      'Clothing',
      'Personal Care',
      'Leisure',
      'Transportation',
      'Insurance',
      'Pets',
    ];

    await queryRunner.manager.insert(
      'expense_group',
      names.map((name) => ({ id: uuidv7(), name })),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete('expense_group', { created_by: null });
  }
}
