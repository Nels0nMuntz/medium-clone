import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Put,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ArticleService } from './article.service';
import { PersistArticleDto } from './dto/persistArticle.dto';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponse } from './types/articleResponse.interface';
import { ArticlesResponse } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<ArticlesResponse> {
    return await this.articleService.findAll(userId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @User() user: UserEntity,
    @Body('article') createArticleDto: PersistArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<ArticleResponse> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(userId, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: PersistArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.updateArticle(
      userId,
      slug,
      updateArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(
      userId,
      slug,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async removeArticleFromFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.articleService.removeArticleFromFavorites(
      userId,
      slug,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
