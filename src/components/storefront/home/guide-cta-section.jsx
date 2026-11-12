"use client";

import Link from "next/link";
import { Wrench, PhoneCall, CheckCircle2, ArrowLeft } from "lucide-react";
import { SITE_CONTENT } from "@/config/site-content";
import { useSiteSettings } from "@/hooks/queries/use-settings";
import { Button } from "@/components/ui/button";

export function GuideCtaSection() {
  const { data: settings } = useSiteSettings();
  const supportPhone = settings?.supportPhone || "۰۲۱-۳۳۹۹۸۸۷۷";
  const { guideCta } = SITE_CONTENT;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/15 border border-orange-500/40 text-orange-300 text-xs font-bold">
                <Wrench className="w-3.5 h-3.5" />
                <span>{guideCta.badge}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold leading-snug text-white">
                {guideCta.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {guideCta.description}
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {guideCta.BulletPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs text-slate-200 bg-slate-800/70 border border-slate-700/80 rounded-lg px-3 py-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="text-xs text-slate-300">
                  ابهام در تشخیص قطعه معیوب یا انتخاب برند؟
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">مشاوره فنی مکانیک:</span>
                  <a
                    href={`tel:${supportPhone}`}
                    dir="ltr"
                    className="text-base font-extrabold text-orange-400 hover:underline"
                  >
                    {supportPhone}
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <Button asChild variant="accent" className="w-full font-bold">
                    <a href={`tel:${supportPhone}`}>
                      <PhoneCall className="w-4 h-4 ml-2" />
                      <span>تماس مستقیم با کارشناس</span>
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-600 bg-transparent text-slate-200 hover:bg-slate-700 hover:text-white"
                  >
                    <Link href="/about">
                      <span>درباره استاندارد و اصالت قطعات</span>
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
