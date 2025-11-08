/*
  Warnings:

  - You are about to drop the column `is_changed` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat"."messages" DROP COLUMN "is_changed",
ADD COLUMN     "is_edited" BOOLEAN DEFAULT false;
