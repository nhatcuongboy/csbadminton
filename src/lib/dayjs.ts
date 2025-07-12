// src/lib/dayjs.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import vi from "dayjs/locale/vi";

// Kích hoạt các plugin
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

// Thiết lập locale mặc định là tiếng Việt
dayjs.locale(vi);

// (Tùy chọn) Thiết lập timezone mặc định, ví dụ: Asia/Ho_Chi_Minh
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

export default dayjs;
