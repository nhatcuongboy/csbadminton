# ✅ Fix: Server/Client Function Error

## 🚨 Lỗi gặp phải:
```
Error creating session: Error: Attempted to call generateCourtName() from the server but generateCourtName is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.
```

## 🔍 Nguyên nhân:
- Function `generateCourtName` được định nghĩa trong file có `"use client"` directive
- Nhưng lại được gọi từ server-side API routes
- Next.js không cho phép gọi client functions từ server

## 🛠️ Giải pháp:
1. **Tạo file server-side utilities**: `src/lib/server/sessions.ts`
   - Không có `"use client"` directive
   - Chứa các functions cần thiết cho server-side

2. **Giữ lại file client-side**: `src/lib/api/sessions.ts`
   - Có `"use client"` directive  
   - Chứa functions cho client components

3. **Cập nhật imports**:
   - API routes sử dụng: `@/lib/server/sessions`
   - Client components sử dụng: `@/lib/api/sessions`

## 📁 Cấu trúc file sau khi fix:

### Server-side: `src/lib/server/sessions.ts`
```typescript
// NO "use client" directive
export function generateCourtName(courtNumber: number): string { ... }
export function getCourtDisplayName(...): string { ... }
export function mapSessionStatus(...): string { ... }
export function formatDate(...): string { ... }
export function formatTime(...): string { ... }
export function formatDuration(...): string { ... }
```

### Client-side: `src/lib/api/sessions.ts`
```typescript
"use client";
export function getCourtDisplayName(...): string { ... }
export function mapSessionStatus(...): string { ... }
export function formatDate(...): string { ... }
export function formatTime(...): string { ... }
export function formatDuration(...): string { ... }
```

## 🔧 Files được cập nhật:

### API Routes (Server-side):
- `src/app/api/sessions/route.ts`
- `src/app/api/sessions/[id]/route.ts`

### Client Components:
- `src/components/session/SessionDetailContent.tsx`
- `src/app/join/status/page.tsx`

## ✅ Kết quả:
- ✅ Lỗi server/client function đã được fix
- ✅ API routes hoạt động bình thường
- ✅ Client components vẫn sử dụng được các utility functions
- ✅ Court name tự động tạo: "Sân A", "Sân B", "Sân C"...
- ✅ Session tạo thành công với court names

## 🎯 Test thành công:
- Tạo session mới: ✅
- Hiển thị court names: ✅
- BadmintonCourt component: ✅
- Host và Player UI: ✅

---
*Fixed: July 4, 2025*
*Issue: Server/Client function separation in Next.js*
