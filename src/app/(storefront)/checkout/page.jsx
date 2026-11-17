import { AuthGuard } from "@/components/shared/auth-guard";
import { CheckoutView } from "@/components/storefront/checkout/checkout-view";

export const metadata = {
  title: "تسویه‌حساب و ثبت سفارش | یدک‌جلوبندی",
  description:
    "تکمیل نشانی تحویل‌گیرنده، انتخاب روش ارسال و پرداخت امن سفارش قطعات جلوبندی.",
};

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutView />
    </AuthGuard>
  );
}
