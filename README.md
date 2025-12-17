# 💬 Nest Chat Application

A scalable, high-performance chat application built with a **Monorepo** architecture using **Turborepo**. The system is designed to handle real-time communication, media sharing, and granular role-based access control.

**⚠️ Current Status:**

- ✅ **Backend REST API:** Fully Implemented
- 🚧 **WebSockets (Notifications):** In Progress (Todo)
- 📝 **Frontend (Web Client):** Planned (Todo)

## 🚀 Live Demo (API)

The backend is currently deployed and accessible at:

Base URL: http://51.21.92.39

_(Note: Since the frontend is not yet built, you can test the endpoints using Postman, Insomnia, or curl)._

---

## 🛠 Tech Stack

### Core

- **Monorepo Tooling:** Turborepo
- **Package Manager:** pnpm / npm

### Backend (`apps/backend`)

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Storage:** AWS S3
- **Validation:** class-validator

### Infrastructure

- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx (optional/planned)

---

## ✨ Key Features (Backend)

The backend implements a robust architecture supporting complex chat scenarios:

1.  **Advanced RBAC (Role-Based Access Control):**
    - Roles are not hardcoded enums but dynamic entities linked to specific chats.
    - Granular permissions system (e.g., `message.text.create`, `message.media.create`, `user.add`).

2.  **Media Handling:**
    - Dedicated `Media` entity separating file metadata (width, height, mimetype) from messages.
    - Direct integration with S3 for storing images and avatars.

3.  **Chat Types:**
    - **Direct (Private):** 1-on-1 conversations.
    - **Group:** Multi-user channels with custom roles.

4.  **Message Features:**
    - Text and Media messages.
    - Editing history (`isEdited` flags).
    - Reactions (Unique per user/message).

---

## 🏁 Getting Started

### Prerequisites

- Docker & Docker Compose

### 1. Clone the repository

Bash

```
git clone https://github.com/matshp0/NestChat
cd NestChat
```

### 2. Environment Variables

Create a `.env` file in the root or specifically for the backend (depending on your docker config). Ensure you have the following credentials:

Code snippet

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chat_db"

# AWS S3 / MinIO
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=chat-media

# Auth
JWT_SECRET=your_super_secret_jwt_key

```

### 3. Run with Docker

Use the production compose file to spin up the backend and database.

Bash

```
docker compose -f docker-compose.prod.yml up -d --build

```

The server will start at port `80` .

---

Based on the code provided, here is the updated **API Overview** section for your README.

I have updated the paths to match your Controllers exactly (e.g., registration is now `POST /users` instead of `/auth/register`, and I included the specific RBAC and Media endpoints).

---

## 📡 API Overview

The REST API is built with **NestJS** (using the **Fastify** adapter).

- **Authentication:** Access Tokens (JWT) are returned in the JSON body. Refresh Tokens are handled securely via `HttpOnly` cookies.
- **Permissions:** Most `/chats` endpoints are protected by a `PermissionGuard`.
- **File Uploads:** specific endpoints support `multipart/form-data`.

### 🔐 Authentication (`/auth`)

- `POST /auth/login` — Login with credentials. Returns `accessToken` and sets a secure `refresh_token` cookie.
- `GET /auth/refresh` — Refresh the access token using the HttpOnly cookie.

### 👤 Users (`/users`)

- `GET /users` — Get a list of all users.
- `POST /users` — **Register** a new user.
- `GET /users/me` — Get the currently logged-in user's profile.
- `GET /users/:id` — Get public profile of a specific user.
- `GET /users/:userId/chats` — Get list of chats the user belongs to.
- **Avatar Management:**
  - `POST /users/:id/avatar` — Upload user avatar (Limit: 2MB).
  - `DELETE /users/:id/avatar` — Delete user avatar.

### 💬 Chats (`/chats`)

**General & Settings**

- `GET /chats` — Get all chats the current user is part of.
- `POST /chats` — Create a new chat (Group or Direct).
- `GET /chats/:chatId` — Get specific chat details.
- `POST /chats/:chatId/avatar` — Upload chat avatar (Limit: 2MB).

**Members & Roles (RBAC)**

- `GET /chats/:chatId/users` — List all users in the chat.
- `POST /chats/:chatId/users/:userId` — Add a user to the chat.
- `GET /chats/:chatId/roles` — List available roles in the chat.
- `POST /chats/:chatId/roles` — Create a new custom role.
- `PUT /chats/:chatId/users/:userId/roles` — Assign a role to a user.

**Messages inside Chats**

- `GET /chats/:chatId/messages` — Get message history (supports pagination).
- `POST /chats/:chatId/messages/text` — Send a **text** message.
- `POST /chats/:chatId/messages/media` — Send a **file/media** message (Limit: 10MB).
- `PATCH /chats/:chatId/messages/:messageId` — Edit a message.
- `DELETE /chats/:chatId/messages/:messageId` — Delete a message.

### 📨 Global Messages (`/messages`)

_(Mainly for admin/debugging or specific direct access)_

- `GET /messages` — Retrieve all messages globally.
- `GET /messages/:id` — Retrieve a specific message by ID.

---

## 🗺 Roadmap

- [x] **Database Design:** ER Diagram and Prisma Schema
- [x] **Backend Architecture:** NestJS Modules & Shared DTOs
- [x] **REST API:** CRUD for Users, Chats, and Messages
- [x] **File Storage:** S3 Integration for Avatars/Media
- [ ] **WebSockets:** Real-time events (`new_message`, `user_typing`)
- [ ] **Frontend Application:** Next.js UI implementation
- [ ] **CI/CD:** Automated testing and deployment pipelines
