// src/app/platform/layout.tsx

"use client";

import React, { ReactNode } from "react";
import { AppProvider } from "../context/AppContext";
import PlatformShell from "../components/PlatformShell";
import PlatformAuthGuard from "../components/PlatformAuthGuard";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  // IMPORTANT: This layout must always render the exact same structure on the
  // server and the client's first render. Auth state is only available on the
  // client (it is loaded from localStorage), so if we branched on it here the
  // server HTML and client HTML would diverge and React would throw a hydration
  // mismatch. Instead we always render the guard shell and let
  // PlatformAuthGuard handle auth gating/loading/redirects after hydration.
  return (
    <AppProvider>
      <PlatformAuthGuard>
        <PlatformShell>{children}</PlatformShell>
      </PlatformAuthGuard>
    </AppProvider>
  );
}