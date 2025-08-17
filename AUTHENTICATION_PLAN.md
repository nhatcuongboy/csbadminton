# Badminton App - Authentication System Plan

## 📋 Overview

Comprehensive authentication system for badminton session management with dual player access flows: authenticated hosts and guest players with unique join codes.

## 🎯 Authentication Architecture

### Core Components

- **NextAuth.js v5** - Modern authentication framework
- **Prisma ORM** - Database operations with PostgreSQL
- **JWT Strategy** - Stateless session management
- **OAuth Support** - Google authentication integration
- **Player-specific Join Codes** - Unique 8-character codes per player slot

## 🔐 Authentication Flows

### 1. Host Authentication Flow

```
User Journey:
Home Page → "Host Mode" → Sign In/Sign Up → Dashboard → Create Session → Generate Player Codes
```

**Features:**

- Email/password registration and login
- Google OAuth integration
- Role-based access (HOST/PLAYER)
- Session management capabilities
- Player code generation and sharing

### 2. Guest Player Flow

```
Player Journey:
Home Page → "Join as Player" → Enter Code → Fill Info → Join Session
```

**Features:**

- No account required
- Player-specific 8-character join codes
- QR code support for mobile
- Player information collection
- Session joining without authentication

## 🗄️ Database Schema

### Authentication Tables

```sql
-- User management
User {
  id: String @id
  email: String @unique
  password: String?
  name: String?
  role: UserRole (HOST/PLAYER)
  image: String?
  emailVerified: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}

-- OAuth accounts
Account {
  id: String @id
  userId: String
  type: String
  provider: String
  providerAccountId: String
  refresh_token: String?
  access_token: String?
  expires_at: Int?
  token_type: String?
  scope: String?
  id_token: String?
  session_state: String?
  createdAt: DateTime
  updatedAt: DateTime
}

-- Session tokens
AuthSession {
  id: String @id
  sessionToken: String @unique
  userId: String
  expires: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

-- Email verification
VerificationToken {
  identifier: String
  token: String @unique
  expires: DateTime
}
```

### Player Management

```sql
Player {
  id: String @id
  sessionId: String
  playerNumber: Int
  joinCode: String @unique  -- 8-character code
  qrCodeData: String?       -- QR code payload
  isJoined: Boolean         -- Join status
  name: String?
  level: Level?
  phone: String?
  gender: Gender?
  status: PlayerStatus
  userId: String?           -- Optional link to User
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🛠️ Implementation Status

### ✅ Phase 1: Core Authentication (COMPLETED)

- [x] Database schema with auth tables
- [x] NextAuth.js v5 configuration
- [x] Credentials provider (email/password)
- [x] Google OAuth provider
- [x] JWT session strategy
- [x] User registration API
- [x] Password hashing with bcryptjs
- [x] Environment variables setup

### ✅ Phase 2: UI Components (COMPLETED)

- [x] Sign In page (`/[locale]/auth/signin`)
- [x] Sign Up page (`/[locale]/auth/signup`)
- [x] Join by Code page (`/[locale]/join-by-code`)
- [x] Player Status page (`/[locale]/player-status`)
- [x] Chakra UI v3 compatible components
- [x] Form validation with React Hook Form
- [x] Loading states and error handling
- [x] Mobile responsive design

### ✅ Phase 3: Player Join System (COMPLETED)

- [x] Player-specific join codes (8 characters)
- [x] QR code generation utilities
- [x] Join by code API (`/api/join-by-code`)
- [x] Player status tracking API
- [x] Session player codes API
- [x] Guest token management
- [x] Player information collection

### 🔄 Phase 4: Integration & Navigation (IN PROGRESS)

- [x] Homepage navigation updates
- [x] Host Mode → Sign In redirection
- [x] Join as Player → Join by Code flow
- [ ] Host dashboard for player code management
- [ ] Protected routes middleware
- [ ] Real-time player status updates

## 📁 File Structure

### Authentication Core

```
src/
├── lib/
│   └── auth.ts                 # NextAuth.js configuration
├── app/api/auth/
│   ├── [...nextauth]/route.ts  # NextAuth API routes
│   └── register/route.ts       # User registration
└── utils/
    └── session-join-helpers.ts # Join code utilities
```

### UI Components

```
src/app/[locale]/
├── auth/
│   ├── signin/page.tsx         # Sign in form
│   └── signup/page.tsx         # Sign up form
├── join-by-code/page.tsx       # Guest join interface
└── player-status/page.tsx      # Player status tracking
```

### API Endpoints

```
src/app/api/
├── auth/
│   ├── [...nextauth]/          # NextAuth handlers
│   └── register/               # User registration
├── join-by-code/               # Guest player join
├── player-status/              # Player status API
└── sessions/[id]/
    ├── player-codes/           # Get player codes
    └── join-guest/             # Deprecated join API
```

## 🔧 Configuration

### Environment Variables

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Default Host
DEFAULT_HOST_ID=clxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### NextAuth.js Setup

- **Adapter**: Prisma adapter for database integration
- **Providers**: Credentials (email/password) + Google OAuth
- **Session**: JWT strategy for stateless authentication
- **Callbacks**: Custom JWT and session handling for roles
- **Pages**: Custom sign-in page configuration

## 🚀 API Endpoints

### Authentication APIs

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - User logout
- `GET /api/auth/signin/google` - Google OAuth

### Player Join APIs

- `POST /api/join-by-code` - Join session with player code
- `GET /api/player-status` - Check player join status
- `GET /api/sessions/[id]/player-codes` - Get session player codes

## 🎨 User Experience

### Host Experience

1. **Landing Page**: Clear "Host Mode" CTA
2. **Authentication**: Seamless login/signup with Google option
3. **Session Creation**: Auto-generates unique codes for each player slot
4. **Code Sharing**: QR codes and 8-digit codes for easy sharing
5. **Management**: Dashboard to track player joins and session status

### Player Experience

1. **Landing Page**: "Join as Player" CTA
2. **Code Entry**: Simple interface for QR scan or manual entry
3. **Information**: Collect name, level, phone, preferences
4. **Confirmation**: Immediate feedback on successful join
5. **Status**: Real-time session and player status updates

## 🔮 Next Steps

### Phase 5: Advanced Features

- [ ] Host dashboard with player management
- [ ] Real-time WebSocket updates for player status
- [ ] Email notifications for session invites
- [ ] Player profile persistence across sessions
- [ ] Session templates and recurring sessions

### Phase 6: Security & Performance

- [ ] Rate limiting on authentication endpoints
- [ ] Advanced session security with refresh tokens
- [ ] Audit logging for authentication events
- [ ] Performance optimization for large sessions
- [ ] Enhanced error handling and user feedback

### Phase 7: Mobile Optimization

- [ ] Progressive Web App (PWA) enhancements
- [ ] Native QR code scanning
- [ ] Push notifications for session updates
- [ ] Offline capability for basic features
- [ ] Mobile-first responsive improvements

## 📊 Success Metrics

### Technical Metrics

- ✅ Build success rate: Target 100%
- ✅ Authentication response time: < 500ms
- ✅ Join code validation: < 200ms
- ✅ Session creation: < 1s

### User Experience Metrics

- 🎯 Host onboarding: < 2 minutes
- 🎯 Player join flow: < 30 seconds
- 🎯 Code sharing success: > 95%
- 🎯 Mobile usability score: > 90

## 🔗 Dependencies

### Core Authentication

- `next-auth@5.0.0-beta.25` - Authentication framework
- `@auth/prisma-adapter` - Database adapter
- `bcryptjs` - Password hashing
- `@prisma/client` - Database ORM

### UI Components

- `@chakra-ui/react@3.23.0` - Component library
- `react-hook-form` - Form management
- `@hookform/resolvers/zod` - Form validation
- `lucide-react` - Icons

### Utilities

- `jose` - JWT handling
- `crypto` - Secure random generation
- `qrcode` - QR code generation (future)

---

**Status**: ✅ Authentication system fully operational with dual access flows
**Last Updated**: August 16, 2025
**Next Milestone**: Host dashboard and protected routes implementation
