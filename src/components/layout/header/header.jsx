"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PhoneCall, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { AccountMenu } from "@/components/layout/header/account-menu";
import { LiveSearch } from "@/components/layout/header/live-search";
import { CarSelectorPill } from "@/components/storefront/car-selector/car-selector-pill";
import { SITE_CONTENT } from "@/config/site-content";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn, formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { getCartTotals, useCartStore } from "@/store/use-cart-store";
import { useUiStore } from "@/store/use-ui-store";

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { data: settings } = useSiteSettings();

  const items = useCartStore((s) => s.items);
  const { totalCount } = getCartTotals(items, settings);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const openMobileNav = useUiStore((s) => s.openMobileNav);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-slate-200">
      {/* نوار اطلاع‌رسانی بالای هدر (فقط دسکتاپ) */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs">
        <div className="container mx-auto flex items-center justify-between py-1.5 px-4 gap-4">
          <span className="inline-flex items-center gap-2 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
            {settings?.topAnnouncementText ||
              "تأمین مستقیم قطعات جلوبندی از بازار چراغ‌برق تهران با ۱۲ ماه گارانتی کتبی تعویض"}
          </span>

          <a
            href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}
            className="inline-flex items-center gap-1.5 font-bold text-white hover:text-orange-300 transition-colors shrink-0"
          >
            <PhoneCall className="h-3.5 w-3.5 text-accent" />
            <span>مشاوره فنی: {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}</span>
          </a>
        </div>
      </div>

      {/* ردیف اصلی هدر */}
      <div className="container mx-auto px-4 py-2.5 lg:py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-5">
          {/* دکمه منوی موبایل + لوگو */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={openMobileNav}
              aria-label="باز کردن منو"
              className="lg:hidden h-9 w-9 text-slate-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo compact />
          </div>

          {/* جستجوی زنده (تبلت و دسکتاپ) */}
          <div className="hidden md:block flex-1 max-w-lg">
            <LiveSearch />
          </div>

          {/* انتخاب خودرو + حساب کاربری + سبد خرید */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:block">
              <CarSelectorPill />
            </div>

            {hydrated && isAuthenticated ? (
              <AccountMenu />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 gap-1.5 border-slate-300 px-2.5 sm:px-3 text-xs font-bold text-slate-800"
                asChild
              >
                <Link href="/login" aria-label="ورود یا ثبت‌نام">
                  <User className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="hidden sm:inline">ورود / ثبت‌نام</span>
                </Link>
              </Button>
            )}

            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={openCartDrawer}
              aria-label="سبد خرید"
              className="h-9 sm:h-10 gap-1.5 px-2.5 sm:px-3.5 font-bold"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">سبد خرید</span>
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-white px-1.5 text-xs font-black text-accent tabular-nums">
                {hydrated ? formatNumber(totalCount) : "۰"}
              </span>
            </Button>
          </div>
        </div>

        {/* ردیف دوم ساده و سبک برای موبایل و تبلت */}
        <div className="mt-2.5 flex flex-col gap-2 lg:hidden">
          <div className="md:hidden">
            <LiveSearch />
          </div>
          <CarSelectorPill className="w-full h-9" />
        </div>
      </div>

      {/* نوار نوبار دسکتاپ */}
      <div className="hidden lg:block border-t border-slate-100 bg-slate-50/70">
        <div className="container mx-auto px-4">
          <nav
            aria-label="منوی اصلی فروشگاه"
            className="flex items-center gap-5 xl:gap-7 py-2.5 text-xs sm:text-sm overflow-x-auto"
          >
            {SITE_CONTENT.navigation.mainLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : !link.href.includes("?") && pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap py-0.5 font-bold transition-colors border-b-2",
                    isActive
                      ? "text-accent border-accent"
                      : link.highlight
                        ? "text-accent border-transparent hover:border-accent/40"
                        : "text-slate-700 border-transparent hover:text-accent"
                  )}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
