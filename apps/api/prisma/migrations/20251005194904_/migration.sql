/*
  Warnings:

  - You are about to drop the column `s3_id` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "s3_id",
ADD COLUMN     "media_id" INTEGER;

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "mimetype" TEXT NOT NULL,
    "height" INTEGER,
    "width" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
