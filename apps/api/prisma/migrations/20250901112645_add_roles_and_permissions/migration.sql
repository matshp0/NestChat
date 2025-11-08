/*
  Warnings:

  - You are about to drop the column `role` on the `users_chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat"."users_chats" DROP COLUMN "role",
ADD COLUMN     "role_id" INTEGER;

-- CreateTable
CREATE TABLE "chat"."roles" (
    "id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."roles_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "roles_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_chat_id_name_key" ON "chat"."roles"("chat_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "chat"."permissions"("name");

-- AddForeignKey
ALTER TABLE "chat"."roles" ADD CONSTRAINT "roles_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."roles_permissions" ADD CONSTRAINT "roles_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "chat"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."roles_permissions" ADD CONSTRAINT "roles_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "chat"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."users_chats" ADD CONSTRAINT "users_chats_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "chat"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
