import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@app/decorators/user.decorator';
import { ProfileResponse } from './types/profileResponse.interface';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') currentUserId: number | null,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfile(
      username,
      currentUserId,
    );
    return this.profileService.buildResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    await this.profileService.followProfile(username, currentUserId);
    const profile = await this.profileService.getProfile(
      username,
      currentUserId,
    );
    return this.profileService.buildResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    await this.profileService.unfollowProfile(username, currentUserId);
    const profile = await this.profileService.getProfile(
      username,
      currentUserId,
    );
    return this.profileService.buildResponse(profile);
  }
}
