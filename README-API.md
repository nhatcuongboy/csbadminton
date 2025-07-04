# Badminton Session Management API

## Phase 1 (Core) Implementation

This is the API documentation for the badminton session management system.

## API Endpoints

### Session Management

- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/start` - Start a session
- `POST /api/sessions/:id/end` - End a session

### Player Management

- `GET /api/sessions/:id/players` - Get players in a session
- `POST /api/sessions/:id/players` - Create a new player in a session
- `GET /api/players/:id` - Get player details
- `PUT /api/players/:id` - Update player details
- `DELETE /api/players/:id` - Remove a player
- `POST /api/players/:id/confirm` - Player confirms participation
- `GET /api/sessions/:id/waiting-queue` - Get waiting players sorted by wait time
- `PUT /api/players/update-wait-times` - Update wait times for waiting players

### Court Management

- `GET /api/sessions/:id/courts` - Get courts in a session
- `POST /api/courts/:id/select-players` - Select players for a court
- `POST /api/courts/:id/start-match` - Start a match on a court
- `POST /api/courts/:id/end-match` - End a match on a court
- `GET /api/courts/:id/current-match` - Get current match details

## Models

### Session

- Buổi chơi cầu lông với cấu hình số sân, thời gian, etc.

### Player

- Người chơi trong buổi với số hiệu, thông tin cá nhân và thống kê

### Court

- Sân chơi với trạng thái và danh sách người chơi hiện tại

### Match

- Trận đấu với thời gian bắt đầu/kết thúc và người chơi tham gia

## Usage Flow

1. Host creates a session
2. Host adds players (or players join with a number)
3. Host starts the session
4. Host selects players for courts
5. Host starts matches
6. Host ends matches, players return to waiting queue
7. Process repeats until session ends
8. End session to get final statistics

## Authentication Flow

For casual players:

1. Enter player number
2. Fill in personal info (if required by session)
3. Join the session

For hosts:

- Full account with email/password
- Create and manage sessions
