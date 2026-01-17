import type { ColumnType } from 'kysely';
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ChatType } from './enums';

export type Chat = {
  id: Generated<number>;
  name: string;
  type: ChatType;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type Media = {
  id: string;
  mimetype: string;
  height: number | null;
  width: number | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type Message = {
  id: Generated<number>;
  chatId: number;
  userId: number;
  isText: boolean;
  mediaId: string | null;
  content: string | null;
  isEdited: Generated<boolean | null>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type MessageReaction = {
  messageId: number;
  userId: number;
  code: string;
  createdAt: Generated<Timestamp>;
};
export type Permission = {
  id: Generated<number>;
  name: string;
};
export type Role = {
  id: Generated<number>;
  chatId: number;
  name: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type RolePermission = {
  roleId: number;
  permissionId: number;
};
export type User = {
  id: Generated<number>;
  username: string;
  displayName: string | null;
  email: string | null;
  passwordHash: string;
  avatarUrl: string | null;
  status: Generated<string | null>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type UserChat = {
  chatId: number;
  userId: number;
  roleId: number | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type DB = {
  chats: Chat;
  media: Media;
  messageReactions: MessageReaction;
  messages: Message;
  permissions: Permission;
  roles: Role;
  rolesPermissions: RolePermission;
  users: User;
  usersChats: UserChat;
};
