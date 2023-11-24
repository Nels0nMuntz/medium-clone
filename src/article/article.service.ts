import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from './dto/persistArticle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleResponse } from './types/articleResponse.interface';
import { ArticlesResponse } from './types/articlesResponse.interface';
import { dataSourceConnection } from '../datasourceConnection';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(userId: number, query: any): Promise<ArticlesResponse> {
    const queryBuilder = (await dataSourceConnection)
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.author,
        },
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.favorited) {
      const user = await this.userRepository.findOne({
        where: {
          username: query.favorited,
        },
        relations: ['favorites'],
      });

      const favoriteArticlesIds = user.favorites.map(({ id }) => id);

      if (favoriteArticlesIds.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', {
          ids: favoriteArticlesIds,
        });
      } else {
        queryBuilder.andWhere('1=0'); // returns empty array of articles
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const favoriteArticlesIds: number[] = [];
    if (userId) {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: ['favorites'],
      });
      user.favorites.forEach(({ id }) => favoriteArticlesIds.push(id));
    }

    const articles = await queryBuilder.getMany();
    const articleWithFavorites = articles.map((article) => {
      const favorited = favoriteArticlesIds.includes(article.id);
      return { ...article, favorite: favorited };
    });

    return { articles: articleWithFavorites, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createArticleDto: PersistArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.author = user;
    article.slug = this.getSlug(createArticleDto.title);
    return await this.articleRepository.save(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneBy({
      slug,
    });

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  async deleteArticle(userId: number, slug: string): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== userId) {
      throw new ForbiddenException('You are not an author');
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    userId: number,
    slug: string,
    updateArticleDto: PersistArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== userId) {
      throw new ForbiddenException('You are not an author');
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    const isNotInfavorites =
      user.favorites.findIndex(
        (favoriteArticle) => favoriteArticle.id === article.id,
      ) === -1;

    if (isNotInfavorites) {
      user.favorites.push(article);
      article.favoritesCount++;
      await Promise.all([
        this.userRepository.save(user),
        this.articleRepository.save(article),
      ]);
    }

    return article;
  }

  async removeArticleFromFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favorites'],
    });

    const articleindex = user.favorites.findIndex(
      (favoriteArticle) => favoriteArticle.id === article.id,
    );

    if (articleindex >= 0) {
      user.favorites.splice(articleindex, 1);
      article.favoritesCount--;
      await Promise.all([
        this.userRepository.save(user),
        this.articleRepository.save(article),
      ]);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponse {
    return {
      article,
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '_' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
