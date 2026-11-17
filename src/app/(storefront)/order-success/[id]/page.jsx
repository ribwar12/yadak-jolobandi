import { AuthGuard } from "@/components/shared/auth-guard";
import { OrderReceiptView } from "@/components/storefront/order/order-receipt-view";

export const metadata = {
  title: "رسید و فاکتور سفارش | یدک‌جلوبندی",
  description: "مشاهده وضعیت سفارش، تایم‌لاین ارسال و فاکتور رسمی قابل چاپ.",
};

export default async function OrderSuccessPage({ params }) {
  const { id } = await params;

  return (
    <AuthGuard>
      <OrderReceiptView orderId={decodeURIComponent(id)} />
    </AuthGuard>
  );
}
