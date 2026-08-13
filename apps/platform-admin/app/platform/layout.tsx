"use client";

import React, { ReactNode } from "react";
import { AppProvider } from "../context/AppContext";
import PlatformShell from "../components/PlatformShell";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <PlatformShell>{children}</PlatformShell>
    </AppProvider>
  );
}
