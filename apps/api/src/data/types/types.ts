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
  display_name: string | null;
  avatar_url: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
};
export type Media = {
  id: string;
  mimetype: string;
  height: number | null;
  width: number | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
};
export type Message = {
  id: Generated<number>;
  chat_id: number;
  user_id: number;
  is_text: boolean;
  media_id: string | null;
  content: string | null;
  is_edited: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
};
export type MessageReaction = {
  message_id: number;
  user_id: number;
  code: string;
  created_at: Generated<Timestamp>;
};
export type Permission = {
  id: Generated<number>;
  name: string;
};
export type Role = {
  id: Generated<number>;
  chat_id: number;
  name: string;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
};
export type RolePermission = {
  role_id: number;
  permission_id: number;
};
export type User = {
  id: Generated<number>;
  username: string;
  display_name: string | null;
  email: string | null;
  password_hash: string;
  avatar_url: string | null;
  status: Generated<string | null>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
};
export type UserChat = {
  chat_id: number;
  user_id: number;
  role_id: number | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
};
export type DB = {
  chats: Chat;
  media: Media;
  message_reactions: MessageReaction;
  messages: Message;
  permissions: Permission;
  roles: Role;
  roles_permissions: RolePermission;
  users: User;
  users_chats: UserChat;
};
