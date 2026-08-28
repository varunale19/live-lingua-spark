# LinguaLive AI — Real-Time Multilingual Video Translation (MERN Stack)

LinguaLive AI is a full-stack MERN application (MongoDB, Express.js, React, Node.js) that enables natural, real-time video translation between participants speaking different languages.

---

## 🌟 Core Product Concept

- **Zero Speaking-Language Setup**: Users are **NEVER** required to configure what language they speak. Users can speak in Telugu, English, Hindi, mixed languages (*"Telugu + English + Hindi"*), or switch languages naturally during calls.
- **Automatic Spoken-Language Processing**: The AI pipeline automatically detects and translates spoken languages.
- **"Language I Want to Hear"**: The **ONLY** language setting chosen by the user is their preferred listening language. Each participant independently selects what they want to hear.

---

## 🏗️ MERN Stack Architecture

```
                    ┌─────────────────────────────────────────┐
                    │            React 19 Frontend            │
                    │      (Vite + Tailwind + TanStack)       │
                    └────────────────────┬────────────────────┘
                                         │  REST API & WebSockets
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │           Node.js + Express Server       │
                    │   (JWT Auth + Socket.IO + Middleware)   │
                    └────────────────────┬────────────────────┘
                                         │  Mongoose ORM
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │            MongoDB Database             │
                    │   (User, Meeting, Participant, Contact) │
                    └─────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
AI/
├── package.json              # Root package script running frontend & backend concurrently
├── backend/                  # Node.js + Express + MongoDB Server
│   ├── package.json
│   ├── .env                  # Port, MONGODB_URI, JWT_SECRET
│   └── src/
│       ├── server.ts         # Express server & Socket.IO WebRTC stream server
│       ├── config/
│       │   └── db.ts         # Mongoose MongoDB connection
│       ├── models/           # Mongoose Data Schemas
│       │   ├── User.ts       # User account schema (name, email, passwordHash, listeningLanguage)
│       │   ├── Meeting.ts    # Meeting session schema
│       │   ├── MeetingParticipant.ts # Individual participant listening languages
│       │   ├── Contact.ts    # Contact list with preferred listening language
│       │   └── MeetingEvent.ts # Translation metadata
│       ├── controllers/      # REST API Business Logic
│       │   ├── authController.ts
│       │   ├── userController.ts
│       │   ├── meetingController.ts
│       │   └── contactController.ts
│       ├── routes/           # Express Routers
│       │   ├── authRoutes.ts
│       │   ├── userRoutes.ts
│       │   ├── meetingRoutes.ts
│       │   └── contactRoutes.ts
│       └── middleware/
│           └── authMiddleware.ts # JWT authentication middleware
└── frontend/                 # React 19 Frontend Client
    ├── package.json
    └── src/
        ├── context/
        │   └── AuthContext.tsx   # Global Auth Provider with backend & local fallback session
        ├── components/
        │   ├── auth/
        │   │   └── AuthModal.tsx # Centered overlay Login & Sign Up modal
        │   ├── dashboard/
        │   │   ├── DashboardLayout.tsx  # Sidebar navigation layout
        │   │   ├── CreateMeetingModal.tsx # Room creation modal
        │   │   └── JoinMeetingModal.tsx   # Room joining & language selection modal
        │   └── landing/          # Preserved Hero, Features, HowItWorks, Languages, About
        └── routes/
            ├── __root.tsx
            ├── index.tsx                 # Hero & Landing page
            ├── dashboard.tsx             # Main user dashboard
            ├── meetings.tsx              # My Meetings history with participant listening languages
            ├── contacts.tsx              # Contacts list with preferred listening languages
            ├── language-preferences.tsx # Language Preferences with mixed-speech AI demo
            └── settings.tsx              # Account, audio/video test, & listening language settings
```

---

## ⚡ API Endpoints (Express.js + MongoDB)

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new account (bcrypt password hashing, JWT cookie)
- `POST /api/auth/login` — Sign in user
- `GET /api/auth/me` — Fetch current user profile
- `POST /api/auth/logout` — End user session
- `POST /api/auth/forgot-password` — Password reset trigger

### User Preferences (`/api/user`)
- `GET /api/user/listening-language` — Fetch current user's listening language
- `PUT /api/user/listening-language` — Update listening language (e.g. Telugu, English, German)
- `PUT /api/user/profile` — Update user profile details

### Meetings (`/api/meetings`)
- `POST /api/meetings/create` — Create a new meeting (Name & Description only)
- `POST /api/meetings/join` — Join room with participant listening language
- `GET /api/meetings` — List user's past and upcoming meetings

### Contacts (`/api/contacts`)
- `GET /api/contacts` — List contacts with preferred listening languages
- `POST /api/contacts` — Add new contact

---

## 🚀 Running the Project locally

1. **Install Dependencies**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Backend & Frontend Concurrently**:
   ```bash
   # From root directory:
   npm run dev
   ```

   - **Frontend**: Runs on `http://localhost:5173`
   - **Backend**: Runs on `http://localhost:5000`
