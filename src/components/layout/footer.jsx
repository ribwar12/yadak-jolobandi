"use client";

import Link from "next/link";
import { Clock, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SITE_CONTENT } from "@/config/site-content";
import { useSiteSettings } from "@/hooks/queries/use-settings";

export function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-16 print:hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ستون ۱: معرفی و آدرس چراغ‌برق */}
          <div className="lg:col-span-5 space-y-4">
            <Logo variant="dark" />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              تخصصی‌ترین مرجع آنلاین تأمین سیستم تعلیق، جلوبندی، جعبه فرمان و کمک‌فنر خودروهای داخلی (پژو، پراید، سمند، تیبا، کوییک، دنا و تارا). تمامی قطعات دارای گارانتی طلایی تعویض کتبی بوده و مستقیماً از بنکداری مرکزی بازار چراغ‌برق تهران ارسال می‌گردند.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>
                  {settings?.address ||
                    "تهران، میدان امام خمینی، خیابان امیرکبیر (چراغ‌برق)، کوچه ناظم‌الاطباء جنوبی، پاساژ سبحان، پلاک ۱۸"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-accent shrink-0" />
                <span>
                  خط ویژه سفارشات و استعلام فنی:{" "}
                  <strong className="text-white" dir="ltr">
                    {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                <span>
                  {settings?.workingHours ||
                    "شنبه تا چهارشنبه ۸:۳۰ الی ۱۹:۰۰ | پنجشنبه‌ها ۸:۳۰ الی ۱۴:۰۰"}
                </span>
              </div>
            </div>
          </div>

          {/* ستون ۲: لینک‌های معتبر */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-black text-white">لینک‌های سریع</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {SITE_CONTENT.footer.quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-accent transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون ۳: دسته‌بندی خودروها */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-black text-white">جلوبندی خودروها</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {SITE_CONTENT.footer.carLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-accent transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون ۴: نمادهای اعتماد و اصالت */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-black text-white">
              مجوزها و تضمین اصالت
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              کلیه قطعات با فاکتور رسمی اتحادیه کشوری لوازم یدکی و هولوگرام اصالت کارخانه عرضه می‌شوند.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SITE_CONTENT.footer.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-center"
                >
                  <ShieldCheck className="h-6 w-6 text-accent mb-1.5" />
                  <span className="text-[11px] font-bold text-white leading-tight">
                    {badge.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {badge.subtitle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* کپی‌رایت پایین فوتر */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            تمامی حقوق مادی و معنوی برای فروشگاه تخصصی «یدک‌جلوبندی» محفوظ است © ۱۴۰۴. اصالت قطعات و ایمنی خودرو اولویت ماست.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-300">
              قوانین و مقررات
            </Link>
            <span>•</span>
            <Link href="/track-order" className="hover:text-slate-300">
              پیگیری مرسوله
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
