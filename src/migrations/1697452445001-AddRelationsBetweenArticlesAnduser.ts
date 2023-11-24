import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationsBetweenArticlesAnduser1697452445001
  implements MigrationInterface
{
  name = 'AddRelationsBetweenArticlesAnduser1697452445001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" ADD "authorId" integer`);
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`,
    );
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "authorId"`);
  }
}
