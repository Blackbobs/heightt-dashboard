// apps/admin-org/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "./components/AdminContext";
import { AdminGuard } from "@/components/AdminGuard";
import { PermissionProvider } from "./context/PermissionContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthHydrator } from "@/components/AuthHydrator";

export const metadata: Metadata = {
  title: "Admin Dashboard — Heightt",
  description:
    "Organization admin dashboard for managing students, dues, payments, and announcements.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthHydrator>
            <PermissionProvider>
              <AdminProvider>
                <AdminGuard>{children}</AdminGuard>
              </AdminProvider>
            </PermissionProvider>
          </AuthHydrator>
        </QueryProvider>
      </body>
    </html>
  );
}