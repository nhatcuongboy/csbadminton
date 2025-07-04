"use client";

import { ReactNode } from "react";
import WaitTimeUpdater from "@/components/session/WaitTimeUpdater";

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <WaitTimeUpdater />
    </>
  );
}
