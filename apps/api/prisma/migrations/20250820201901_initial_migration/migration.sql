-- CreateEnum
CREATE TYPE "chat"."chat_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "chat"."chat_type" AS ENUM ('private', 'group');

-- CreateTable
CREATE TABLE "chat"."chats" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "chat"."chat_type" NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."messages" (
    "id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_text" BOOLEAN NOT NULL,
    "content" TEXT,
    "media_url" TEXT,
    "is_changed" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "status" TEXT DEFAULT 'offline',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat"."users_chats" (
    "chat_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "chat"."chat_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_chats_pkey" PRIMARY KEY ("user_id","chat_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_name_key" ON "chat"."chats"("name");

-- CreateIndex
CREATE INDEX "idx_messages_chat_user" ON "chat"."messages"("chat_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "chat"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "chat"."users"("email");

-- AddForeignKey
ALTER TABLE "chat"."messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "chat"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."users_chats" ADD CONSTRAINT "users_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chat"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat"."users_chats" ADD CONSTRAINT "users_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "chat"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
