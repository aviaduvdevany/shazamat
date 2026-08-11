"use client";

import { useSearchParams } from "next/navigation";
import { loginAction } from "../auth-actions";
import { Music } from "lucide-react";

export default function LoginForm() {
  const params = useSearchParams();
  const hasError = params.get("error") === "1";

  return (
    <div className="w-full max-w-sm" dir="rtl">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/30">
          <Music className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">שאזאמאט</h1>
        <p className="text-zinc-500 text-sm mt-1">כניסה לאזור הניהול</p>
      </div>

      {/* Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-2xl">
        {hasError && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-950/50 border border-red-800/50 rounded-xl">
            <span className="text-red-400 text-sm">⚠</span>
            <p className="text-sm text-red-300">שם משתמש או סיסמה שגויים</p>
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              שם משתמש
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              autoFocus
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/60 transition-all duration-150 hover:border-zinc-600"
              placeholder="admin"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              סיסמה
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/60 transition-all duration-150 hover:border-zinc-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-150 mt-2"
          >
            כניסה לניהול
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-zinc-700 mt-6">שאזאמאט ניהול · סביבה פרטית</p>
    </div>
  );
}
