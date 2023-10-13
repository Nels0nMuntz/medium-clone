import { Injectable } from '@nestjs/common/decorators';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}
  async findAll(): Promise<TagEntity[]> {
    return await this.tagRepository.find();
  }
}
