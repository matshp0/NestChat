export const ChatRole = {
  user: 'user',
  admin: 'admin',
} as const;
export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];
export const ChatType = {
  private: 'private',
  group: 'group',
} as const;
export type ChatType = (typeof ChatType)[keyof typeof ChatType];
