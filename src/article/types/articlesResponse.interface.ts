import { ArticleType } from '@app/user/types/article.type';

export interface ArticlesResponse {
  articles: ArticleType[];
  articlesCount: number;
}
