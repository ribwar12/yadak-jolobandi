"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Package,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    toast.info("از حساب کاربری خود خارج شدید");

    if (
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/checkout")
    ) {
      router.push("/");
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="منوی حساب کاربری"
        className="h-9 sm:h-10 gap-1.5 border-slate-300 px-2.5 sm:px-3 text-xs font-bold text-slate-800"
      >
        <User className="h-4 w-4 text-accent shrink-0" />
        <span className="hidden sm:inline max-w-[110px] truncate">
          {user?.fullName || user?.phone || "حساب من"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-500 transition-transform",
            open && "rotate-180"
          )}
        />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50"
        >
          <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-slate-900 truncate">
                {user?.fullName || "کاربر گرامی"}
              </p>
              {user?.role === "admin" && (
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-accent shrink-0">
                  مدیر
                </span>
              )}
            </div>
            <p
              dir="ltr"
              className="text-[11px] font-mono text-slate-500 text-right mt-0.5"
            >
              {user?.phone}
            </p>
          </div>

          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <User className="h-4 w-4 text-slate-500" />
            <span>پروفایل و آدرس‌های من</span>
          </Link>

          <Link
            href="/profile?tab=orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Package className="h-4 w-4 text-slate-500" />
            <span>سفارش‌های من</span>
          </Link>

          <Link
            href="/track-order"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Truck className="h-4 w-4 text-slate-500" />
            <span>پیگیری مرسوله</span>
          </Link>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>خروج از حساب کاربری</span>
          </button>
        </div>
      )}
    </div>
  );
}
