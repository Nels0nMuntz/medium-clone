import { UserEntity } from '../user.entity';

export type User = Omit<UserEntity, 'password' | 'hashPassword'> & {
  token: string;
};
