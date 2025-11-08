/*
  Warnings:

  - You are about to drop the column `media_url` on the `messages` table. All the data in the column will be lost.
  - Changed the type of `role` on the `users_chats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "chat"."messages" DROP COLUMN "media_url",
ADD COLUMN     "s3_id" TEXT;

-- AlterTable
ALTER TABLE "chat"."users_chats" DROP COLUMN "role",
ADD COLUMN     "role" "chat"."chat_type" NOT NULL;
