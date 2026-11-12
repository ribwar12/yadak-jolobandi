"use client";

import Link from "next/link";
import { ChevronLeft, Info, PhoneCall, User } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SITE_CONTENT } from "@/config/site-content";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { useUiStore } from "@/store/use-ui-store";

export function MobileNav() {
  const hydrated = useHydrated();
  const isOpen = useUiStore((s) => s.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  const { isAuthenticated, user } = useAuthStore();
  const { data: settings } = useSiteSettings();

  const closeMenu = () => setMobileNavOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="right" className="w-[82vw] max-w-xs p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-slate-200 bg-slate-50">
          <SheetTitle className="sr-only">منوی ناوبری فروشگاه</SheetTitle>
          <Logo compact />
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {SITE_CONTENT.navigation.mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={cn(
                "flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-bold transition-colors",
                link.highlight
                  ? "bg-orange-50 text-accent"
                  : "text-slate-800 hover:bg-slate-100"
              )}
            >
              <span>{link.title}</span>
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </Link>
          ))}

          <Link
            href="/about"
            onClick={closeMenu}
            className="flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <span className="inline-flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-400" />
              درباره ما و ضمانت اصالت
            </span>
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          </Link>
        </nav>

        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
          {hydrated && isAuthenticated ? (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-900"
            >
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                {user?.fullName || user?.phone}
              </span>
              <span className="text-accent">حساب کاربری</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"
            >
              <User className="h-4 w-4" />
              ورود / ثبت‌نام
            </Link>
          )}

          <a
            href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}
            className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700"
          >
            <span className="inline-flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              مشاوره و تماس:
            </span>
            <span className="font-bold text-slate-900" dir="ltr">
              {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
            </span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
