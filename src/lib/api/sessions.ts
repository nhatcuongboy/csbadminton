"use client";

// Hàm format date từ ISO string sang định dạng đẹp hơn
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Hàm format time từ ISO string sang định dạng đẹp hơn
export function formatTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Hàm tính duration giữa hai thời điểm
export function formatDuration(start: string, end: string): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));
  return `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
}

// Hàm map SessionStatus từ database sang status cho UI
export function mapSessionStatus(
  status: string
): "upcoming" | "in-progress" | "completed" {
  switch (status) {
    case "PREPARING":
      return "upcoming";
    case "IN_PROGRESS":
      return "in-progress";
    case "FINISHED":
      return "completed";
    default:
      return "upcoming";
  }
}

// Hàm tạo court name mặc định (client-side)
export function getCourtDisplayName(
  courtName?: string,
  courtNumber?: number
): string {
  if (courtName) {
    return courtName;
  }
  if (courtNumber) {
    return `Sân ${courtNumber}`;
  }
  return "Sân";
}
