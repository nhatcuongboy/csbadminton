# Court Name Feature Implementation

## ✅ Hoàn thành: Bổ sung trường "courtName" cho các court

### 1. Database Schema Updates
- ✅ Thêm trường `courtName` vào model `Court` trong `prisma/schema.prisma`
- ✅ Tạo migration để cập nhật database
- ✅ Trường `courtName` là optional (nullable)

### 2. API Updates
- ✅ Cập nhật API tạo session (`/api/sessions`) để tự động tạo courtName
- ✅ Cập nhật API cập nhật session (`/api/sessions/[id]`) để tạo courtName cho court mới
- ✅ Cập nhật tất cả API query để include courtName trong response
- ✅ Cập nhật type definitions trong `lib/api.ts`

### 3. Frontend Components
- ✅ Thêm prop `courtName` vào `BadmintonCourt` component
- ✅ Hiển thị courtName ở góc trên trái của sân
- ✅ Cập nhật `SessionDetailContent` để truyền courtName
- ✅ Cập nhật `join/status/page.tsx` để hiển thị courtName

### 4. Helper Functions
- ✅ Tạo `generateCourtName()` để tạo tên sân theo pattern: "Sân A", "Sân B", etc.
- ✅ Tạo `getCourtDisplayName()` để hiển thị tên sân phù hợp
- ✅ Sử dụng helper functions trong toàn bộ app

### 5. Default Court Names
Khi tạo session mới, hệ thống sẽ tự động tạo tên sân theo pattern:
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
/>
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
