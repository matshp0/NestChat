import { Exclude, Expose } from 'class-transformer';

export class PrivateUserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  displayName?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  email: string;

  @Exclude()
  passwordHash: string;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
