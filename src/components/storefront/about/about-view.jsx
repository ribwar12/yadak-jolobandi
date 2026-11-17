"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Headset,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONTENT } from "@/config/site-content";
import { useSiteSettings } from "@/hooks/queries/use-settings";

const PILLAR_ICONS = {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Headset,
};

export function AboutView() {
  const { data: settings } = useSiteSettings();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-10">
      {/* معرفی فروشگاه */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold text-accent">
          <Wrench className="h-3.5 w-3.5" />
          مرجع تخصصی تعلیق و جلوبندی خودرو در چراغ‌برق تهران
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          درباره {settings?.storeName || "یدک‌جلوبندی"} و شرایط ضمانت کالا
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-loose max-w-3xl">
          فروشگاه تخصصی یدک‌جلوبندی با تمرکز صرف بر قطعات سیستم تعلیق، زیربندی و فرمان خودروهای داخلی و مونتاژی، از دل بازار تخصصی چراغ‌برق تهران فعالیت می‌کند. هدف ما حذف قطعات بی‌کیفیت متفرقه، تضمین تطابق دقیق قطعه با تیپ و سال ساخت خودرو، و رساندن فوری قطعه به دست مالکان و تعمیرکاران است.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="accent" asChild className="font-bold">
            <Link href="/products">مشاهده کاتالوگ قطعات</Link>
          </Button>
          <Button variant="outline" asChild className="font-bold">
            <Link href="/track-order">پیگیری مرسوله</Link>
          </Button>
        </div>
      </section>

      {/* ارکان اعتماد و شرایط گارانتی */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SITE_CONTENT.trustPillars.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.icon] || ShieldCheck;
          return (
            <div
              key={pillar.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-accent border border-orange-200">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-black text-slate-900">
                {pillar.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* شرایط مرجوعی و اطلاعات تماس زنده */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 pb-2 border-b border-slate-100">
            شرایط ضمانت ۱۲ ماهه و عودت کالا
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed list-disc pr-5">
            <li>
              کلیه پک‌های جلوبندی و قطعات شرکتی دارای <strong>۱۲ ماه ضمانت کتبی تعویض</strong> در برابر لقی سیبک، پارگی بوش یا نقص فنی ساخت هستند.
            </li>
            <li>
              در صورت انتخاب قطعه از طریق ابزار <strong>انتخاب خودروی من</strong> و بروز هرگونه مغایرت فنی هنگام نصب، هزینه برگشت و تعویض قطعه بر عهده فروشگاه است.
            </li>
            <li>
              برای بهره‌مندی کامل از گارانتی، نصب قطعات توسط جلوبندساز مجرب و سفت‌کردن پیچ‌های طبق در حالت وزن خودرو روی چرخ الزامی است.
            </li>
          </ul>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-black">
            نشانی انبار مرکزی و ارتباط مستقیم
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-accent shrink-0 mt-1" />
              <p className="leading-relaxed">
                {settings?.address ||
                  "تهران، میدان امام خمینی، خیابان امیرکبیر (چراغ‌برق)، کوچه ناظم‌الاطباء جنوبی، پاساژ سبحان، پلاک ۱۸"}
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-accent shrink-0 mt-1" />
              <p>
                {settings?.workingHours ||
                  "شنبه تا چهارشنبه ۸:۳۰ الی ۱۹:۰۰ | پنجشنبه‌ها ۸:۳۰ الی ۱۴:۰۰"}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0" />
              <a
                href={`tel:${settings?.supportPhoneRaw || "02133990011"}`}
                dir="ltr"
                className="font-mono font-bold text-white hover:text-orange-300"
              >
                {settings?.supportPhone || "۰۲۱-۳۳۹۹۰۰۱۱"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
