import Link from "next/link";
import { AlertCircle, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-accent border border-orange-200 mb-6">
        <AlertCircle className="h-10 w-10" />
      </div>
      <span className="text-sm font-black text-accent mb-2">خطای ۴۰۴</span>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
        صفحه یا قطعه مورد نظر یافت نشد!
      </h1>
      <p className="max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed mb-8">
        ممکن است آدرس صفحه تغییر کرده باشد یا قطعه مورد نظر از کاتالوگ حذف شده باشد. می‌توانید از کاتالوگ قطعات یا جستجوی بالای سایت استفاده کنید.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="accent" size="lg" className="gap-2 font-bold" asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="gap-2 font-bold" asChild>
          <Link href="/products">
            <Search className="h-4 w-4" />
            مشاهده کاتالوگ قطعات
          </Link>
        </Button>
      </div>
    </div>
  );
}
