import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* نوار بالای مینیمال صفحات احراز هویت */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Logo compact />

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-accent hover:text-accent transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>بازگشت به فروشگاه</span>
          </Link>
        </div>
      </header>

      {/* محتوای مرکزی فرم */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-4">
          {children}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>ورود امن با رمز یک‌بار مصرف پیامکی • یدک‌جلوبندی</span>
          </div>
        </div>
      </main>
    </div>
  );
}
