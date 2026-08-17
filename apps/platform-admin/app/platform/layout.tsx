"use client";

import React, { ReactNode } from "react";
import { AppProvider } from "../context/AppContext";
import PlatformShell from "../components/PlatformShell";
import PlatformAuthGuard from "../components/PlatformAuthGuard";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <PlatformAuthGuard>
        <PlatformShell>{children}</PlatformShell>
      </PlatformAuthGuard>
    </AppProvider>
  );
}
