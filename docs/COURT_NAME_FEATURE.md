# Court Name Feature Implementation

## ✅ Completed: Add "courtName" field to courts

### 1. Database Schema Updates

- ✅ Added `courtName` field to `Court` model in `prisma/schema.prisma`
- ✅ Created migration to update the database
- ✅ `courtName` field is optional (nullable)

### 2. API Updates

- ✅ Updated session creation API (`/api/sessions`) to auto-generate courtName
- ✅ Updated session update API (`/api/sessions/[id]`) to generate courtName for new courts
- ✅ Updated all API queries to include courtName in the response
- ✅ Updated type definitions in `lib/api.ts`

### 3. Frontend Components

- ✅ Added `courtName` prop to `BadmintonCourt` component
- ✅ Displayed courtName at the top-left corner of the court
- ✅ Updated `SessionDetailContent` to pass courtName
- ✅ Updated `join/status/page.tsx` to display courtName

### 4. Helper Functions

- ✅ Created `generateCourtName()` to generate court names in the pattern: "Sân A", "Sân B", etc.
- ✅ Created `getCourtDisplayName()` to display the appropriate court name
- ✅ Used helper functions throughout the app

### 5. Default Court Names

When creating a new session, the system will automatically generate court names in the following pattern:

- Court 1: "Sân A"
- Court 2: "Sân B"
- Court 3: "Sân C"
- Court 4: "Sân D"
- Court 5: "Sân E"
- Court 6: "Sân F"
- Court 7: "Sân G"
- Court 8: "Sân H"
- Court 9+: "Sân 9", "Sân 10", ...

### 6. UI Improvements

- ✅ Court name hiển thị trong box trắng ở góc trên trái
- ✅ Styling phù hợp với design system
- ✅ Responsive trên mọi kích thước màn hình

## Files Modified

### Database

- `prisma/schema.prisma` - Added courtName field

### API Routes

- `src/app/api/sessions/route.ts` - Auto-generate courtName on creation
- `src/app/api/sessions/[id]/route.ts` - Auto-generate courtName on update
- `src/app/api/sessions/[id]/status/route.ts` - Include courtName in response
- `src/app/api/players/[id]/route.ts` - Include courtName in response
- `src/app/api/sessions/[id]/wait-times/route.ts` - Include courtName in response
- `src/app/api/sessions/[id]/players/route.ts` - Include courtName in response

### Types

- `src/lib/api.ts` - Updated Court interface

### Components

- `src/components/court/BadmintonCourt.tsx` - Added courtName prop and display
- `src/components/session/SessionDetailContent.tsx` - Pass courtName to BadmintonCourt
- `src/app/join/status/page.tsx` - Display courtName in player status

### Utilities

- `src/lib/api/sessions.ts` - Added helper functions

## Usage Examples

```typescript
// Generate court name for court number
const courtName = generateCourtName(1); // "Sân A"
const courtName = generateCourtName(9); // "Sân 9"

// Get display name (fallback to court number)
const displayName = getCourtDisplayName(court.courtName, court.courtNumber);

// Use in BadmintonCourt component
<BadmintonCourt
  players={players}
  isActive={true}
  courtName={getCourtDisplayName(court.courtName, court.courtNumber)}
  elapsedTime="15:30"
  width="100%"
  height="200px"
  showTimeInCenter={true}
/>;
```

## Benefits

1. **Better User Experience**: Players can easily identify courts by name
2. **Flexible Naming**: Supports custom court names or auto-generated names
3. **Consistent Display**: Fallback to court number if name not available
4. **Scalable**: Works with any number of courts
5. **Backward Compatible**: Existing sessions still work with courtNumber

## Next Steps (Optional)

- [ ] Add UI for hosts to customize court names
- [ ] Add court name to match history
- [ ] Add court name to notifications
- [ ] Add court name validation and uniqueness check
