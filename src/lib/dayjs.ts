// src/lib/dayjs.ts
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import vi from "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/vi";

// Activate plugins
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Set default locale to Vietnamese
dayjs.locale("vi");

// (Optional) Set default timezone, example: Asia/Ho_Chi_Minh
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

export default dayjs;
