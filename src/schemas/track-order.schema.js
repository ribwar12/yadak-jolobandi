import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils";

const normalizeOrderId = (val) => {
  if (typeof val !== "string") return val;
  const cleaned = toEnglishDigits(val.trim()).toUpperCase();
  if (/^\d{6}$/.test(cleaned)) {
    return `YDK-${cleaned}`;
  }
  return cleaned;
};

export const trackOrderSchema = z.object({
  orderId: z.preprocess(
    normalizeOrderId,
    z
      .string({ required_error: "کد رهگیری سفارش را وارد کنید" })
      .min(4, "کد سفارش معتبر نیست (مثال: YDK-984210)")
  ),
});
