export const ORDER_STATUS_META = {
  pending_payment: {
    label: "در انتظار پرداخت",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    stepIndex: 0,
  },
  processing: {
    label: "در حال آماده‌سازی و بسته‌بندی",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    stepIndex: 2,
  },
  shipped: {
    label: "تحویل به پست / باربری شد",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    stepIndex: 3,
  },
  delivered: {
    label: "تحویل مشتری شد",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    stepIndex: 4,
  },
  cancelled: {
    label: "لغو شده / پرداخت ناموفق",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    stepIndex: -1,
  },
};

export const ORDER_TIMELINE_STEPS = [
  { key: "created", title: "ثبت سفارش" },
  { key: "paid", title: "تایید پرداخت" },
  { key: "processing", title: "آماده‌سازی انبار" },
  { key: "shipped", title: "ارسال مرسوله" },
  { key: "delivered", title: "تحویل نهایی" },
];

export function formatPersianDate(isoDate, includeTime = true) {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
