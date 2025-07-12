import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "../providers";
import { routing } from "../../i18n/config";
import { IntlClientProvider } from "../../components/IntlClientProvider";
import RightDrawerMenu from "../../components/ui/RightDrawerMenu";
import LocaleValidator from "../../components/LocaleValidator";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Badminton Session Management",
  description: "Manage badminton sessions, players, and courts",
};

export async function generateStaticParams() {
  return [
    { locale: 'vi' },
    { locale: 'en' }
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocales = ['vi', 'en'];

  // Load messages directly
  let messages = {};
  try {
    if (locale === 'en') {
      messages = (await import("../../i18n/messages/en.json")).default;
    } else if (locale === 'vi') {
      messages = (await import("../../i18n/messages/vi.json")).default;
    } else {
      // Fallback to English
      messages = (await import("../../i18n/messages/en.json")).default;
    }
  } catch (error) {
    console.error("Error loading messages:", error);
    // Fallback to English
    try {
      messages = (await import("../../i18n/messages/en.json")).default;
    } catch (fallbackError) {
      console.error("Error loading fallback messages:", fallbackError);
      messages = {};
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleValidator locale={locale} validLocales={validLocales} />
        <IntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <RightDrawerMenu />
            {children}
            <Toaster />
          </Providers>
        </IntlClientProvider>
      </body>
    </html>
  );
}
