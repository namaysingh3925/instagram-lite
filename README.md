# Instagram Lite (Full-Stack Social Platform)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready, full-stack social media web application modeled after Instagram. Built with a modern **React 19 + Vite** frontend and an **Express.js + MongoDB (Mongoose)** backend, **Instagram Lite** features real-time notifications via **Socket.IO**, role-based access control (RBAC) with a dedicated **content moderation queue**, personalized chronological feed aggregation, unique like constraints, comment threads, and Winston-based structured audit logging.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Application Workflows](#application-workflows)
  - [1. User Authentication & Session Lifecycle](#1-user-authentication--session-lifecycle)
  - [2. Feed Aggregation & Social Graph Workflow](#2-feed-aggregation--social-graph-workflow)
  - [3. Real-Time Notification Workflow (Socket.IO)](#3-real-time-notification-workflow-socketio)
  - [4. Content Reporting & Moderator Action Workflow](#4-content-reporting--moderator-action-workflow)
- [Database Architecture & Data Models](#database-architecture--data-models)
  - [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
  - [Indexing & Database Optimization](#indexing--database-optimization)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users & Profiles](#users--profiles)
  - [Posts & Feed](#posts--feed)
  - [Likes & Comments](#likes--comments)
  - [Follow System](#follow-system)
  - [Notifications](#notifications)
  - [Moderation & Reports](#moderation--reports)
- [Real-Time WebSocket Protocol](#real-time-websocket-protocol)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started & Local Setup](#getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Running the Application](#4-running-the-application)
- [Testing User vs Moderator Roles](#testing-user-vs-moderator-roles)
- [License](#license)

---

## Overview

Instagram Lite demonstrates real-world software engineering practices for social networks:
- **Clean RESTful API Architecture**: Modular routes, controllers, models, and middleware.
- **Relational Integrity in NoSQL**: Compound unique indexes in MongoDB to prevent duplicate likes, double-following, or duplicate pending reports.
- **Real-Time Push Communication**: WebSockets integrated with JWT handshake authentication to stream notifications immediately without client polling.
- **Role-Based Access Control (RBAC)**: Distinguishes between standard `user` accounts and `moderator` accounts with protected moderation queues.
- **Enterprise-Grade Logging**: Winston-powered structured logging capturing request metadata, security warnings, and error stacks to both console and log files (`logs/error.log`, `logs/combined.log`).

---

## Key Features

| Category | Capability | Details |
| :--- | :--- | :--- |
| **Authentication** | Secure Auth & RBAC | Password hashing with `bcryptjs` (salt rounds: 10), JWT issued on login, protected route middleware, and role checks (`user`, `moderator`). |
| **Social Graph** | Follow / Unfollow | Self-follow prevention, follower/following count lookups, and compound index enforcement. |
| **Posts & Media** | Post Management | Create posts with image URLs & captions, edit captions (author-only), and delete posts. |
| **Engagement** | Likes & Comments | Unique post liking (no duplicate likes), like counter, chronological comment threads with author details. |
| **Personalized Feed** | Dynamic Feed Engine | Generates a chronological stream combining posts from followed accounts and the user's own posts with hydrated like states. |
| **Real-Time System** | Instant Notifications | Socket.IO room-per-user design push alerts when followed or unfollowed, with unread badge count and mark-as-read API. |
| **Moderation Engine** | Reporting & Review | Users can flag inappropriate posts; moderators get a dedicated `/review` dashboard to group reports, inspect content, mark safe, or delete offending posts. |
| **User Search & Profile** | Discovery & Stats | Case-insensitive regex user search, full profile stats (post count, follower/following counts, follow status toggle). |

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + Vite)"]
        UI["React UI (Pages & Components)"]
        AC["AuthContext (JWT in LocalStorage)"]
        NC["NotificationContext (Socket Client)"]
        AX["Axios HTTP Client (Bearer Auth)"]
    end

    subgraph Gateway["Server Layer (Node.js & Express 5)"]
        HTTP["HTTP Server (Express & CORS)"]
        SIO["Socket.IO Server (JWT Handshake Auth)"]
        MW["Middleware (authMiddleware, roleMiddleware)"]
        CTRL["Controllers (Auth, Post, Feed, Report, User, Socket)"]
        LOG["Winston Logger (Console & File Transports)"]
    end

    subgraph Database["Data Layer (MongoDB)"]
        MDB[("MongoDB 6+ Database")]
        UColl[("users")]
        PColl[("posts")]
        CColl[("comments")]
        LColl[("likes")]
        FColl[("follows")]
        NColl[("notifications")]
        RColl[("reports")]
    end

    UI --> AC
    UI --> NC
    UI --> AX

    AX -- "REST API (JSON, Bearer Token)" --> MW
    NC -- "WebSocket Connection (ws://, JWT Handshake)" --> SIO

    MW --> CTRL
    CTRL --> LOG
    CTRL --> MDB

    SIO -- "Room-based Emission (socket.to(userId))" --> NC
    CTRL -. "Emit Notification Event" .-> SIO

    MDB --- UColl
    MDB --- PColl
    MDB --- CColl
    MDB --- LColl
    MDB --- FColl
    MDB --- NColl
    MDB --- RColl
```

---

## Application Workflows

### 1. User Authentication & Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant Client as React Client (AuthContext)
    participant API as Express API (/api/auth)
    participant DB as MongoDB (Users Collection)

    User->>Client: Enters credentials (username, password)
    Client->>API: POST /api/auth/login { username, password }
    API->>DB: User.findOne({ username })
    DB-->>API: Returns user document with hashed password
    API->>API: bcrypt.compare(password, user.password)
    alt Invalid Password / User Not Found
        API-->>Client: 401 Unauthorized ("Invalid username or password")
        Client-->>User: Display error notification
    else Credentials Valid
        API->>API: jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' })
        API-->>Client: 200 OK { token, user: { id, name, username, role } }
        Client->>Client: Store token in localStorage & set Auth state
        Client->>Client: Establish Socket.IO connection with JWT token
        Client-->>User: Redirect to Feed ("/") or Protected Page
    end
```

---

### 2. Feed Aggregation & Social Graph Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant React as React Feed Page
    participant API as Feed Controller (/api/feed)
    participant DB as MongoDB

    User->>React: Visits Feed ("/")
    React->>API: GET /api/feed (Authorization: Bearer token)
    API->>DB: Follow.find({ follower: req.user.userId }).select("following")
    DB-->>API: Returns list of followed user IDs
    API->>API: Combine [userId, ...followingIds]
    API->>DB: Post.find({ author: { $in: feedUserIds } }).sort({ createdAt: -1 })
    DB-->>API: Returns matching post documents populated with author info
    loop For Each Post (Parallel Promise.all)
        API->>DB: Like.countDocuments({ post: postId })
        API->>DB: Like.exists({ post: postId, user: req.user.userId })
    end
    API-->>React: 200 OK [ { ...post, likesCount, isLiked } ]
    React-->>User: Render interactive chronological post stream
```

---

### 3. Real-Time Notification Workflow (Socket.IO)

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Alice (User A)
    actor Bob as Bob (User B)
    participant ClientA as Alice's Browser
    participant ClientB as Bob's Browser (Socket.IO Client)
    participant Server as Node.js Backend (Socket.IO)
    participant DB as MongoDB

    Alice->>ClientA: Clicks "Follow" on Bob's profile
    ClientA->>Server: POST /api/users/:bobId/follow (Bearer Token: Alice)
    Server->>DB: Follow.create({ follower: aliceId, following: bobId })
    Server->>DB: Notification.create({ recipient: bobId, sender: aliceId, type: 'follow' })
    DB-->>Server: Saved notification document
    Server->>Server: req.app.get("io").to(bobId).emit("notification", notification)
    Server-->>ClientA: 201 Created { message: "User followed" }
    Server-->>ClientB: WebSocket Event: "notification"
    ClientB->>ClientB: Increment unreadCount (+1) & prepend notification to state
    ClientB-->>Bob: Real-time notification badge updates instantly
```

---

### 4. Content Reporting & Moderator Action Workflow

```mermaid
flowchart TD
    Start([User encounters offending post]) --> ReportPost["User clicks 'Report' button"]
    ReportPost --> ReqReport["POST /api/posts/:id/report"]
    
    CheckSelf{Is author reporting own post?}
    ReqReport --> CheckSelf
    CheckSelf -- Yes --> Reject400["400 Bad Request: Cannot report own post"]
    CheckSelf -- No --> CheckPending{Is there already a pending report by this user?}
    
    CheckPending -- Yes --> Reject409["409 Conflict: Already reported and pending"]
    CheckPending -- No --> SaveReport["Create Report (status: 'pending') or reopen past report"]
    
    SaveReport --> ModVisits["Moderator logs in and visits '/review'"]
    ModVisits --> ReqQueue["GET /api/reports (authMiddleware + roleMiddleware: 'moderator')"]
    
    CheckRole{User role == 'moderator'?}
    ReqQueue --> CheckRole
    CheckRole -- No --> Reject403["403 Forbidden: Insufficient role permissions"]
    CheckRole -- Yes --> GroupReports["Group pending reports by postId, count flags & aggregate reporters"]
    
    GroupReports --> ModView["Display report queue with post preview & reporter usernames"]
    ModView --> Decision{"Moderator Action"}
    
    Decision -- "Dismiss / Keep Safe" --> MarkSafe["PUT /api/reports/posts/:id/safe"]
    MarkSafe --> UpdateSafe["Update Report status: 'safe', set reviewedBy = moderatorId"]
    UpdateSafe --> ClearedSafe["Post remains live; removed from pending queue"]
    
    Decision -- "Violates Guidelines" --> DeletePost["DELETE /api/reports/posts/:id"]
    DeletePost --> RemovePostDoc["Post.findByIdAndDelete(postId)"]
    RemovePostDoc --> UpdateRemoved["Update Report status: 'removed', set reviewedBy = moderatorId"]
    UpdateRemoved --> ClearedRemoved["Post deleted permanently; reports cleared from review queue"]
```

---

## Database Architecture & Data Models

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ POST : "creates"
    USER ||--o{ COMMENT : "authors"
    USER ||--o{ LIKE : "gives"
    USER ||--o{ FOLLOW : "follower / following"
    USER ||--o{ NOTIFICATION : "recipient / sender"
    USER ||--o{ REPORT : "reporter / reviewer"
    POST ||--o{ COMMENT : "contains"
    POST ||--o{ LIKE : "receives"
    POST ||--o{ REPORT : "flagged in"

    USER {
        ObjectId _id PK
        string name "min 2, max 50"
        string username UK "lowercase, min 3, max 30"
        string email UK "lowercase"
        string password "hashed bcrypt"
        string bio "max 150 chars"
        string profilePicture "URL string"
        string role "user | moderator"
        Date createdAt
        Date updatedAt
    }

    POST {
        ObjectId _id PK
        ObjectId author FK "ref User"
        string image "required URL / base64"
        string caption "max 2200 chars"
        Date createdAt
        Date updatedAt
    }

    COMMENT {
        ObjectId _id PK
        ObjectId post FK "ref Post"
        ObjectId author FK "ref User"
        string text "required, max 500 chars"
        Date createdAt
        Date updatedAt
    }

    LIKE {
        ObjectId _id PK
        ObjectId user FK "ref User"
        ObjectId post FK "ref Post"
        Date createdAt
    }

    FOLLOW {
        ObjectId _id PK
        ObjectId follower FK "ref User"
        ObjectId following FK "ref User"
        Date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK "ref User"
        ObjectId sender FK "ref User"
        string type "follow | unfollow"
        boolean isRead "default false"
        Date createdAt
        Date updatedAt
    }

    REPORT {
        ObjectId _id PK
        ObjectId post FK "ref Post"
        ObjectId reporter FK "ref User"
        string status "pending | safe | removed"
        ObjectId reviewedBy FK "ref User"
        Date createdAt
        Date updatedAt
    }
```

---

### Indexing & Database Optimization

Strategic indexes enforce uniqueness and deliver fast read/write speeds even under heavy loads:

| Collection | Indexed Fields | Index Type | Constraint / Purpose |
| :--- | :--- | :--- | :--- |
| **`users`** | `username` | Single Field | `unique: true` — Fast lookup for authentication and profile routes. |
| **`users`** | `email` | Single Field | `unique: true` — Guarantees unique email per registered user. |
| **`posts`** | `{ author: 1, createdAt: -1 }` | Compound | Fast retrieval of user profile post history sorted chronologically. |
| **`comments`** | `{ post: 1, createdAt: -1 }` | Compound | Fast fetch of comments under any post in reverse chronological order. |
| **`likes`** | `{ user: 1, post: 1 }` | Compound Unique | `unique: true` — Prevents race condition double-likes from the same user. |
| **`follows`** | `{ follower: 1, following: 1 }` | Compound Unique | `unique: true` — Prevents duplicate follow relationships. |
| **`follows`** | `following` | Secondary Index | Enables high-performance lookups for *"Who follows user X?"*. |
| **`notifications`** | `{ recipient: 1, createdAt: -1 }` | Compound | Fast pagination and sorting of notifications for recipient. |
| **`notifications`** | `{ recipient: 1, isRead: 1 }` | Compound | Fast aggregation of unread notification counter badge. |
| **`reports`** | `{ reporter: 1, post: 1 }` | Compound Unique | `unique: true` — Restricts user to a single active report per post. |
| **`reports`** | `{ status: 1, post: 1 }` | Compound | Ultra-fast grouping and querying of pending moderation queue items. |

---

## API Reference

Base URL: `http://localhost:5000` (or `http://localhost:5000/api`)

### Authentication

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/register` | No | Any | Register user (`name`, `username`, `email`, `password`, `bio`, `profilePicture`). |
| `POST` | `/api/auth/login` | No | Any | Authenticate with `username` and `password`. Returns JWT token. |

---

### Users & Profiles

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/users/search?q=:query` | Yes | Any | Search users by name or username (case-insensitive regex, max 20). |
| `GET` | `/api/users/:id` | Yes | Any | Get user profile details, posts, counts (posts, followers, following), and `isFollowing`. |
| `PUT` | `/api/users/:id` | Yes | Owner | Update user's own profile (`name`, `bio`, `profilePicture`). |

---

### Posts & Feed

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/feed` | Yes | Any | Get chronological feed containing posts by followed users and logged-in user. |
| `POST` | `/api/posts` | Yes | Any | Create a new post with `image` (URL / data) and `caption`. |
| `GET` | `/api/posts/:id` | Yes | Any | Get single post details with author information, likes count, and `isLiked` state. |
| `PUT` | `/api/posts/:id` | Yes | Author | Update post `caption` (must be the post author). |
| `DELETE` | `/api/posts/:id` | Yes | Author | Delete post (must be the post author). |

---

### Likes & Comments

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/posts/:id/like` | Yes | Any | Like a post (enforces unique like constraint). |
| `DELETE` | `/api/posts/:id/like` | Yes | Any | Unlike a post. |
| `POST` | `/api/posts/:id/comments` | Yes | Any | Add a comment to a post (`text`). |
| `GET` | `/api/posts/:id/comments` | Yes | Any | Fetch all comments for a post sorted chronologically. |
| `DELETE` | `/api/comments/:id` | Yes | Author | Delete comment (must be the comment author). |

---

### Follow System

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/users/:id/follow` | Yes | Any | Follow a user. Triggers real-time notification to the target user. |
| `DELETE` | `/api/users/:id/follow` | Yes | Any | Unfollow a user. Emits real-time unfollow event. |

---

### Notifications

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/notifications` | Yes | Any | Get user's notifications (up to 50) and `unreadCount`. |
| `PUT` | `/api/notifications/read` | Yes | Any | Mark all unread notifications as read. |

---

### Moderation & Reports

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/posts/:id/report` | Yes | Any | Report an offending post (author cannot report own post). |
| `GET` | `/api/reports` | Yes | `moderator` | Fetch all pending reported posts grouped by post with report count and reporters. |
| `PUT` | `/api/reports/posts/:postId/safe` | Yes | `moderator` | Dismiss reports and mark post status as safe. |
| `DELETE` | `/api/reports/posts/:postId` | Yes | `moderator` | Remove post from platform and mark reports as removed. |

---

## Real-Time WebSocket Protocol

The application leverages **Socket.IO** with a private room architecture:

```javascript
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.join(socket.userId);
});
```

When an event occurs (such as Alice following Bob):
1. Express controller triggers `notifyUser(req, "follow", recipientId)`.
2. Server emits to the specific room: `io.to(String(recipientId)).emit("notification", notification)`.
3. Client `NotificationContext` receives the payload, increments the notification bell counter, and updates the UI without page reload.

---

## Project Directory Structure

```bash
Instagram lite V4/
└── Instagram lite/
    ├── controllers/
    │   ├── authController.js
    │   ├── commentController.js
    │   ├── feedController.js
    │   ├── followController.js
    │   ├── notificationController.js
    │   ├── postController.js
    │   ├── reportController.js
    │   └── userController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    ├── models/
    │   ├── Comment.js
    │   ├── Follow.js
    │   ├── Like.js
    │   ├── Notification.js
    │   ├── Post.js
    │   ├── Report.js
    │   └── User.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── commentRoutes.js
    │   ├── feedRoutes.js
    │   ├── followRoutes.js
    │   ├── notificationRoutes.js
    │   ├── postRoutes.js
    │   ├── reportRoutes.js
    │   └── userRoutes.js
    ├── utils/
    │   └── logger.js
    ├── logs/
    │   ├── combined.log
    │   └── error.log
    ├── client/
    │   ├── src/
    │   │   ├── api/
    │   │   │   ├── auth.js
    │   │   │   ├── client.js
    │   │   │   ├── feed.js
    │   │   │   ├── notifications.js
    │   │   │   ├── posts.js
    │   │   │   ├── reports.js
    │   │   │   └── users.js
    │   │   ├── components/
    │   │   │   ├── Avatar.jsx
    │   │   │   ├── CommentSection.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── NotificationBell.jsx
    │   │   │   ├── PostCard.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── ReportButton.jsx
    │   │   ├── context/
    │   │   │   ├── AuthContext.jsx
    │   │   │   └── NotificationContext.jsx
    │   │   ├── pages/
    │   │   │   ├── CreatePost.jsx
    │   │   │   ├── EditProfile.jsx
    │   │   │   ├── Feed.jsx
    │   │   │   ├── Login.jsx
    │   │   │   ├── PostView.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── Register.jsx
    │   │   │   ├── Review.jsx
    │   │   │   └── Search.jsx
    │   │   ├── App.jsx
    │   │   ├── index.css
    │   │   └── main.jsx
    │   ├── .env
    │   ├── package.json
    │   └── vite.config.js
    ├── .env
    ├── app.js
    ├── db.js
    ├── package.json
    ├── server.js
    └── socket.js
```

---

## Getting Started & Local Setup

### Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB Community Server running locally on port `27017` (or MongoDB Atlas connection URI).
- Git installed on your system.

---

### 1. Clone Repository

```bash
git clone https://github.com/namaysingh3925/instagram-lite.git
cd instagram-lite
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd "Instagram lite V4/Instagram lite"
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (`.env`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/instagram_lite
   JWT_SECRET=your_super_secret_jwt_key_here
   LOG_LEVEL=info
   ```

4. Ensure MongoDB is running:
   ```bash
   net start MongoDB
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Setup

1. Open a new terminal window and navigate to the client folder:
   ```bash
   cd "Instagram lite V4/Instagram lite/client"
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (`client/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```

---

### 4. Running the Application

Open your browser and navigate to:
```
http://localhost:5173
```

Features available:
1. Register a new account at `/register`.
2. Log in at `/login`.
3. Create a post at `/create`.
4. Search users and follow them at `/search`.
5. View personalized feed at `/`.

---

## Testing User vs Moderator Roles

Instagram Lite includes role-based access control out of the box.

### Default Role: `user`
Every newly registered user is assigned `role: "user"` by default:
- Can post, like, comment, follow, search, and report offending posts.
- Does not have access to `/review` (blocked by `roleMiddleware.js` and protected React routing).

### Promoting a User to `moderator`
To test the moderation workflow, promote an existing user to `moderator` in MongoDB:

```bash
mongosh
use instagram_lite
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "moderator" } }
);
```

### Accessing the Moderation Queue
1. Log in with the promoted moderator account.
2. The navbar will display the **Review** navigation link.
3. Visit `http://localhost:5173/review`.
4. Inspect reported posts, review flags, and choose to **Mark as Safe** or **Delete Post**.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Namay Singh**  
- GitHub: [@namaysingh3925](https://github.com/namaysingh3925)
- Repository: [instagram-lite](https://github.com/namaysingh3925/instagram-lite)
