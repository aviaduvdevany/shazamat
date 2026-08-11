import type { Metadata } from "next";
import { Toaster } from "sonner";
import { logoutAction } from "./auth-actions";
import { LogOut, Music } from "lucide-react";

export const metadata: Metadata = {
  title: "ניהול | שאזאמאט",
  robots: "noindex,nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        {/* Top nav */}
        <header className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-md">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white tracking-tight">שאזאמאט</span>
                <span className="text-zinc-600 text-xs font-normal mt-0.5">ניהול</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
              <a
                href="/admin/shows"
                className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-all duration-150"
              >
                הופעות
              </a>
            </nav>

            {/* Logout */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 rounded-md transition-all duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>התנתק</span>
              </button>
            </form>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
        <Toaster position="bottom-left" richColors theme="dark" />
      </body>
    </html>
  );
}
