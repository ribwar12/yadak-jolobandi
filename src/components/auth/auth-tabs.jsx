import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthModeTabs({ activeMode = "login", redirectPath = "/" }) {
  const query =
    redirectPath && redirectPath !== "/"
      ? `?redirect=${encodeURIComponent(redirectPath)}`
      : "";

  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
      <Link
        href={`/login${query}`}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs sm:text-sm font-extrabold transition-all",
          activeMode === "login"
            ? "bg-white text-accent shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        <LogIn className="h-4 w-4" />
        <span>ورود</span>
      </Link>

      <Link
        href={`/register${query}`}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs sm:text-sm font-extrabold transition-all",
          activeMode === "register"
            ? "bg-white text-accent shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        <UserPlus className="h-4 w-4" />
        <span>ثبت‌نام</span>
      </Link>
    </div>
  );
}
