import { Exclude, Expose } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  displayName?: string;

  @Expose()
  avatarUrl?: string;

  @Exclude()
  email: string;

  @Exclude()
  passwordHash: string;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
