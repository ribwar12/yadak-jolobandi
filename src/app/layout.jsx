import { Vazirmatn } from "next/font/google";
import { Toaster } from "sonner";
import QueryProvider from "@/lib/query-provider";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata = {
  title: "یدک‌جلوبندی | فروشگاه قطعات تخصصی جلوبندی و تعلیق خودرو",
  description:
    "مرجع تخصصی خرید آنلاین لوازم جلوبندی و زیربندی انواع خودروهای ایرانی (پژو، پراید، سمند، تیبا، دنا) با ضمانت کتبی اصالت کالا",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            dir="rtl"
            richColors
            closeButton
            toastOptions={{
              className: "font-sans text-sm",
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
