/*
  Warnings:

  - The primary key for the `media` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_media_id_fkey";

-- AlterTable
ALTER TABLE "media" DROP CONSTRAINT "media_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "media_id_seq";

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "media_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
