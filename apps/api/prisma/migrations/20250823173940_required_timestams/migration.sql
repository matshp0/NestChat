/*
  Warnings:

  - Made the column `created_at` on table `chats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `chats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users_chats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users_chats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chat"."chats" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "chat"."messages" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "chat"."users" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "chat"."users_chats" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
