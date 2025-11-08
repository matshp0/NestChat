-- CreateIndex
CREATE INDEX "idx_messages_chat_created_at" ON "chat"."messages"("chat_id", "created_at");
