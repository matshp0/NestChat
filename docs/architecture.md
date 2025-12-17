# NestChat Architecture Overview

## 1. Component Diagram (Software Component Diagram)

In a Monorepo context, the architecture is divided into three main layers: **Client Side (Frontend)**, **Server Side (Backend)**, and **Shared Libraries**.

### Key Components

- **Frontend App:** React/Next.js application.
- **API Gateway / Controller Layer:** Entry point in NestJS (REST Controllers & WebSocket Gateways).
- **Service Layer:** Business logic.
- **Data Access Layer (Repository):** Database operations.
- **Infrastructure:** Postgres, S3.
- **Shared DTO Package:** Shared interfaces.

### Component Diagram (C4 / Container Level)

```mermaid
graph TD
subgraph "Client Side"
FE[Frontend SPA/PWA]
end

subgraph "Turborepo Shared Packages"
DTO[Shared DTOs & Types]
end

subgraph "Server Side (NestJS)"
subgraph "API Layer"
RestCtrl[REST Controllers]
WSGate[WebSocket Gateway]
end

subgraph "Modules"
AuthM[Auth Module]
ChatM[Chat/Message Module]
UserM[User Module]
FileM[Files Module]
end

subgraph "Infrastructure Layer"
TypeORM[TypeORM / Prisma]
S3Service[S3 Service Client]
end
end

subgraph "External Services"
DB[(PostgreSQL)]
S3Bucket[(AWS S3 / MinIO)]
end

%% Interactions
FE -- "HTTPS (CRUD)" --> RestCtrl
FE -- "WSS (Events)" --> WSGate
FE -.-> DTO
RestCtrl -.-> DTO

RestCtrl --> AuthM & ChatM & UserM & FileM
WSGate --> ChatM

ChatM --> TypeORM
UserM --> TypeORM
FileM --> S3Service

TypeORM --> DB
S3Service --> S3Bucket

classDef shared fill:#f9f,stroke:#333,stroke-width:2px;
class DTO shared;
```

**Interaction Explanation:**

- **Shared DTO:** Frontend imports request/response types. Backend uses them for validation (`class-validator`). TypeScript ensures consistency across frontend and backend.
- **REST:** Handles authorization, message history, file uploads (Multipart/form-data), and profile updates.
- **WebSockets:** Handles real-time events. Clients subscribe to events (e.g., `message_received`) to update UI without reload.

---

## 2. ER Diagram (Entity-Relationship Diagram)

Key entities: **Users**, **Chats (rooms)**, and **Messages**. Files stored in S3 are represented by links in the DB.

```mermaid
erDiagram
    User {
        Int id PK
        String username UK
        String email UK
        String passwordHash
        String avatarUrl
        String status
        DateTime createdAt
    }

    Chat {
        Int id PK
        String name UK
        Enum type "private, group"
        String displayName
        String avatarUrl
        DateTime createdAt
    }

    UserChat {
        Int userId PK, FK
        Int chatId PK, FK
        Int roleId FK "Optional"
        DateTime joinedAt "createdAt"
    }

    Role {
        Int id PK
        Int chatId FK
        String name
    }

    Permission {
        Int id PK
        String name UK
    }

    RolePermission {
        Int roleId PK, FK
        Int permissionId PK, FK
    }

    Message {
        Int id PK
        Int chatId FK
        Int userId FK
        Boolean isText
        String mediaId FK "Optional"
        String content "Optional"
        Boolean isEdited
        DateTime createdAt
    }

    Media {
        String id PK "UUID"
        String mimetype
        Int height
        Int width
        DateTime createdAt
    }

    MessageReaction {
        Int messageId PK, FK
        Int userId PK, FK
        String code
        DateTime createdAt
    }

    %% Relationships
    User ||--o{ UserChat : "participates"
    Chat ||--o{ UserChat : "has members"

    User ||--o{ Message : "sends"
    Chat ||--o{ Message : "contains"

    Chat ||--o{ Role : "defines scope"
    Role ||--o{ UserChat : "assigned to member"

    Role ||--o{ RolePermission : "has"
    Permission ||--o{ RolePermission : "belongs to"

    Media ||--o{ Message : "attached to"

    User ||--o{ MessageReaction : "reacts"
    Message ||--o{ MessageReaction : "has"
```

---

## 3. Data Flow & Scenarios

### Scenario A: Sending a Text Message

**Hybrid approach (REST + WS)**

1.  **Initiation:** User types a message and clicks "Send".
2.  **Validation (Shared):** Frontend validates via Shared DTO.
3.  **Persistence (REST):**
    - POST `/api/chats/:id/messages`
    - `ChatController` receives request
    - `ChatService` saves message in PostgreSQL

4.  **Notification (WebSocket):**
    - `ChatService` triggers `ChatGateway`
    - Gateway sends `new_message` event to all clients in the room

5.  **UI Update:** Other users receive event and update chat list in real-time (Redux/React State)

---

### Scenario B: Uploading Media File to a chat

**REST + S3 + DB**

1.  **Upload (REST):**
    - User selects file
    - Frontend sends FormData to POST `/chats/:chatId/messages/media`

2.  **Processing & Storage:**
    - `ChatService` validates image and transforms it into `webp` format
    - Streams file to AWS S3
    - S3 returns key

3.  **Update DB:**
    - Backend stores metadata about file in PostgreSQL

4.  **Response:**
    - Backend returns user object with generated pre-signed url for file
    - Optionally, WebSocket emits `user_updated` event for instant UI update
