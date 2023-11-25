import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDB1697191056743 implements MigrationInterface {
  name = 'SeedD1697191056743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );

    // password "123"
    await queryRunner.query(
        `INSERT INTO public."user" (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$sb6FXe8PuK8w6uioXxVgBe5UG1lJj2dGjf4PzWDlGEvhdCss7SVJ2')`,
    );

    await queryRunner.query(
      `INSERT INTO public."articles" (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'coffee,dragons', 1), ('second-article', 'Second article', 'Second article description', 'Second article body', 'coffee,dragons', 1)`,
    );
  }

  public async down(): Promise<void> {}
}
