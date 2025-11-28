# AEZEN Backend - The Ultimate Guide

Welcome to the backend documentation for **AEZEN**. This guide is written for you to understand not just *what* the code does, but *why* it was built this way and *how* the pieces fit together.

---

## 1. The Big Picture: Architecture

### The Core Concept: Multi-Tenancy (SDPT)
**What is it?**
We use a **Separate Database Per Tenant (SDPT)** architecture.
*   **Tenant**: A brand or company using your software (e.g., "Nike", "Adidas").
*   **SDPT**: Instead of putting everyone's data in one big box, we give each tenant their own private box (database).

**Why did we do this?**
1.  **Security**: If "Nike" gets hacked, "Adidas" data is safe because it's in a completely different database.
2.  **Data Leak Prevention**: It is impossible for a bug to accidentally show Nike's chats to Adidas, because the system physically connects to a different database for each request.
3.  **Scalability**: If one tenant becomes huge, we can move their database to a bigger server without affecting others.

**How it works:**
1.  **Master DB (`aezen_master`)**: This is the "Phonebook". It stores the list of tenants and users. It knows which database belongs to whom.
2.  **Tenant DBs (`aezen_brand_a_...`)**: These are the "Private Diaries". They store the actual chats and messages.

---

## 2. Module-by-Module Deep Dive

Here is every part of your backend, explained simply.

### A. AuthModule (Authentication)
**Purpose**: Handles Login, Registration, and Security.
**Key Files**:
*   `auth.controller.ts`: Receives login requests.
*   `auth.service.ts`: Checks passwords (using bcrypt) and generates Tokens.
*   `jwt.strategy.ts`: The "Bouncer". It checks every incoming request to see if the user has a valid Token.

**The Logic**:
We use **JWT (JSON Web Tokens)**. When a user logs in, we give them a digital ID card (Token). This card contains their `tenantId`. For every future request, they show this card. The backend reads the `tenantId` from the card to know which database to open.

**Frontend Connection**:
*   **Frontend File**: `client/src/pages/auth-page.tsx`
*   **Interaction**: When you fill the login form, it calls `POST /api/auth/login`.

---

### B. TenantModule (The "Switchboard")
**Purpose**: Magically connects the app to the correct database for each request.
**Key Files**:
*   `tenant-connection.manager.ts`: A smart cache. It keeps database connections open so we don't have to reconnect every millisecond.
*   `tenant-db-manager.service.ts`: The "Switcher". When a request comes in, it looks at the User's Token, finds the `tenantId`, and asks the Connection Manager for the correct database connection.
*   `tenant.utils.ts`: Contains `ensureTenantDatabaseExists`. This checks if a tenant's DB exists; if not, it creates it on the fly (Lazy Creation).

**The Logic**:
This is the most complex part. We use **Request Scoped Services**. This means for *every single HTTP request*, a tiny dedicated service is created that knows "I am working for Tenant A right now". It grabs Tenant A's database connection and gives it to the other services (like ChatService).

---

### C. WhatsAppModule (The Integration)
**Purpose**: Connects your app to the real WhatsApp network.
**Key Files**:
*   `whatsapp.service.ts`: The brain. It uses a library called `@whiskeysockets/baileys`.
    *   It creates a "Session" (a folder with credentials) for each tenant.
    *   It handles QR code generation.
    *   It listens for real WhatsApp messages and saves them to the DB.
*   `whatsapp.gateway.ts`: The "Broadcaster". When a QR code arrives or a message comes in, this sends it to the Frontend via WebSockets.

**The Logic**:
WhatsApp doesn't have a simple API for this. We run a "Virtual WhatsApp Web" instance inside the backend.
*   **Sessions**: Stored in the `sessions/` folder. Each tenant has a unique folder (e.g., `sessions/uuid-of-tenant`). This keeps their WhatsApp accounts separate.
*   **Auto-Reconnect**: On startup, `onModuleInit` scans this folder and turns on all the virtual phones again.

**Frontend Connection**:
*   **Frontend File**: `client/src/components/integration-card.tsx` & `whatsapp-qr-dialog.tsx`
*   **Interaction**:
    *   Clicking "Connect" calls `POST /api/integrations/whatsapp/toggle`.
    *   The QR code you see is sent via the WebSocket event `qr`.

---

### D. ChatModule (The Messaging Core)
**Purpose**: Manages the Chat History and Real-time messaging.
**Key Files**:
*   `chat.controller.ts`: The API. Handles requests like "Give me all conversations" or "Send a message".
*   `chat.service.ts`: The Worker. It talks to the **Tenant DB**. It saves messages, updates "Last Message" status, and handles the "Mark as Read" logic.
*   `chat.gateway.ts`: The Real-time link. When you send a message from the UI, it goes here first.

**The Logic**:
*   **Sending**: Frontend -> Controller -> Service -> Save to DB -> WhatsAppService -> Real WhatsApp.
*   **Receiving**: Real WhatsApp -> WhatsAppService -> Save to DB -> Gateway -> Frontend UI.

**Frontend Connection**:
*   **Frontend Files**: `client/src/components/conversation-list.tsx` (Left side) & `chat-view.tsx` (Right side).
*   **Interaction**:
    *   Loading the list calls `GET /api/conversations`.
    *   Sending a message calls `POST /api/conversations/:id/send`.
    *   New messages appear instantly because of the `incoming_message` socket event.

---

### E. UsersModule & TeamModule
**Purpose**: Managing the people who use the dashboard.
**Key Files**:
*   `users.service.ts`: Handles creating new users. Crucially, when a new Tenant signs up, this service generates the **Unique Database Name** (e.g., `aezen_brand_1732...`) to prevent collisions.

---

## 3. How Data Flows (Example: Sending a Message)

1.  **You** type "Hello" in the Frontend (`chat-view.tsx`) and hit Send.
2.  **Frontend** sends a POST request to `/api/integrations/whatsapp/send`.
3.  **Backend Guard** (`jwt-auth.guard.ts`) stops the request: "Who are you?". It checks your Token. "Okay, you are Tenant A".
4.  **Controller** (`whatsapp.controller.ts`) receives the request.
5.  **Service** (`whatsapp.service.ts`) takes over:
    *   It finds Tenant A's active WhatsApp Session.
    *   It uses the Session to send "Hello" to the real WhatsApp servers.
    *   It connects to **Tenant A's Database** (using `TenantConnectionManager`).
    *   It saves the message into the `message` table.
    *   It updates the `conversation` table (sets `lastMessage` to "Hello").
6.  **Gateway** (`whatsapp.gateway.ts`) shouts: "New message sent!".
7.  **Frontend** hears the shout and updates the chat bubble instantly.

---

## 4. Database Schema (The Tables)

### Master DB (`aezen_master`)
*   **`tenant`**: `id`, `name`, `dbName` (The map to the private DBs).
*   **`user`**: `email`, `password`, `tenantId` (Links user to tenant).

### Tenant DB (`aezen_brand_...`)
*   **`conversation`**:
    *   `contactName`: "John Doe"
    *   `contactNumber`: "1234567890"
    *   `platform`: "whatsapp"
    *   `lastMessage`: "Hello"
    *   `unreadCount`: 2
*   **`message`**:
    *   `content`: "Hello"
    *   `sender`: "agent" or "user"
    *   `type`: "text" or "image"
    *   `isRead`: true/false

---

## 5. Summary for Future You

*   **Want to add a new API?** Create a Controller in the relevant module.
*   **Want to store new data?** Create an Entity in the `chat` folder (if it's tenant data) or `users` folder (if it's global).
*   **Frontend not showing data?** Check `ChatController` and `ChatGateway`.
*   **WhatsApp not connecting?** Check `WhatsAppService` and the `sessions/` folder.

This backend is designed to be **safe**, **scalable**, and **isolated**. You have a solid foundation here!
