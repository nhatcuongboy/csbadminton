import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/config";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|vi)/:path*']
};
