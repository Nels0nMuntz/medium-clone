import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsernameToUser1697362679123 implements MigrationInterface {
    name = 'AddUsernameToUser1697362679123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    }

}
