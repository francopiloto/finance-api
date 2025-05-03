import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1746217872028 implements MigrationInterface {
  name = 'InitialSchema1746217872028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "user_id" uuid NOT NULL, CONSTRAINT "UQ_a0a4d5f5441e696d7bb0ad3b1fa" UNIQUE ("user_id", "name"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense_group" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "created_by" uuid, CONSTRAINT "UQ_17d291aa36657e08dc88abadfb1" UNIQUE ("created_by", "name"), CONSTRAINT "PK_b50aa03fde43af4d14eb84e6c2d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_method" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "issuer" character varying(255), "statement_closing_day" smallint NOT NULL DEFAULT '0', "due_day" smallint NOT NULL DEFAULT '0', "user_id" uuid NOT NULL, CONSTRAINT "PK_7744c2b2dd932c9cf42f2b9bc3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."installment_status_enum" AS ENUM('PENDING', 'PAID', 'SCHEDULED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "installment" ("id" uuid NOT NULL, "status" "public"."installment_status_enum" NOT NULL DEFAULT 'PENDING', "value" numeric(10,2) NOT NULL, "billing_month" date NOT NULL, "paid_at" TIMESTAMP WITH TIME ZONE, "expense_id" uuid NOT NULL, "user_id" uuid NOT NULL, "payment_method_id" uuid NOT NULL, CONSTRAINT "PK_c79b5b68e8b6293a0210ce7dbda" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expense_priority_enum" AS ENUM('ESSENTIAL', 'IMPORTANT', 'OPTIONAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense" ("id" uuid NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "priority" "public"."expense_priority_enum" NOT NULL, "description" character varying(255), "beneficiary" character varying(255), "group_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_edd925b450e13ea36197c9590fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_token" ("id" uuid NOT NULL, "device" character varying(100) NOT NULL, "refresh_token_hash" character varying(512) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "UQ_7a7f12c4a0e706c47e1564266ec" UNIQUE ("user_id", "device"), CONSTRAINT "PK_4572ff5d1264c4a523f01aa86a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_group" ADD CONSTRAINT "FK_c93746984f37a9cc0b8d2283ce4" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method" ADD CONSTRAINT "FK_b9f0b59dc5fd5150f2df494a480" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" ADD CONSTRAINT "FK_bbb41804276cb8ffe675ae80c0a" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" ADD CONSTRAINT "FK_469f1d00003d83ba96630ea1a72" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" ADD CONSTRAINT "FK_c2c9f4c2e71ce440584bde9621e" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" ADD CONSTRAINT "FK_b50aa03fde43af4d14eb84e6c2d" FOREIGN KEY ("group_id") REFERENCES "expense_group"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" ADD CONSTRAINT "FK_8aed1abe692b31639ccde1b0416" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_token" ADD CONSTRAINT "FK_26b580c89e141c75426f44317bc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_token" DROP CONSTRAINT "FK_26b580c89e141c75426f44317bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_8aed1abe692b31639ccde1b0416"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_b50aa03fde43af4d14eb84e6c2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" DROP CONSTRAINT "FK_c2c9f4c2e71ce440584bde9621e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" DROP CONSTRAINT "FK_469f1d00003d83ba96630ea1a72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" DROP CONSTRAINT "FK_bbb41804276cb8ffe675ae80c0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_method" DROP CONSTRAINT "FK_b9f0b59dc5fd5150f2df494a480"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_group" DROP CONSTRAINT "FK_c93746984f37a9cc0b8d2283ce4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`,
    );
    await queryRunner.query(`DROP TABLE "auth_token"`);
    await queryRunner.query(`DROP TABLE "expense"`);
    await queryRunner.query(`DROP TYPE "public"."expense_priority_enum"`);
    await queryRunner.query(`DROP TABLE "installment"`);
    await queryRunner.query(`DROP TYPE "public"."installment_status_enum"`);
    await queryRunner.query(`DROP TABLE "payment_method"`);
    await queryRunner.query(`DROP TABLE "expense_group"`);
    await queryRunner.query(`DROP TABLE "wallet"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
