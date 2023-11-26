import { UserEntity } from '@app/user/user.entity';

export type Profile = Pick<UserEntity, 'username' | 'bio' | 'image'> & {
  following: boolean;
};
