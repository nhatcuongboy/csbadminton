import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badminton Session Management",
  description: "Manage badminton sessions, players, and courts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
