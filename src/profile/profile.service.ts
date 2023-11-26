import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './types/profile.type';
import { UserEntity } from '@app/user/user.entity';
import { ProfileResponse } from './types/profileResponse.interface';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  async getProfile(
    username: string,
    currentUserId: number | null,
  ): Promise<Profile> {
    const targetUser = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Profile not found');
    }

    const profile: Profile = {
      username: targetUser.username,
      bio: targetUser.bio,
      image: targetUser.image,
      following: false,
    };

    // if not authenticated
    if (!currentUserId) {
      return profile;
    }

    const currentUser = await this.userRepository.findOne({
      where: {
        id: currentUserId,
      },
    });

    if (!currentUser) {
      throw new BadRequestException();
    }

    const isFollowing = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    });

    return {
      username: targetUser.username,
      bio: targetUser.bio,
      image: targetUser.image,
      following: Boolean(isFollowing),
    };
  }

  async followProfile(
    username: string,
    currentUserId: number,
  ): Promise<Profile> {
    const targetUser = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Profile not found');
    }

    // user cannot follow himself
    if (targetUser.id === currentUserId) {
      throw new BadRequestException('Follower and following cannot be equal');
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: targetUser.id,
      },
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = currentUserId;
      followToCreate.followingId = targetUser.id;
      await this.followRepository.save(followToCreate);
    }

    return { ...targetUser, following: true };
  }

  async unfollowProfile(
    username: string,
    currentUserId: number,
  ): Promise<Profile> {
    const targetUser = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Profile not found');
    }

    if (targetUser.id === currentUserId) {
      throw new BadRequestException('Follower and following cannot be equal');
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: targetUser.id,
    });

    return { ...targetUser, following: false };
  }

  buildResponse(profile: Profile): ProfileResponse {
    return { profile };
  }
}
