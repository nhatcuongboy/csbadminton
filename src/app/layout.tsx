import { routing } from '@/i18n/config';
import { redirect } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to default locale
  redirect(`/${routing.defaultLocale}`);
}
