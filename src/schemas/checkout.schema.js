import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils";

const cleanDigits = (val) =>
  typeof val === "string" ? toEnglishDigits(val.trim()) : val;

export const checkoutSchema = z.object({
  fullName: z
    .string({ required_error: "نام و نام خانوادگی تحویل‌گیرنده الزامی است" })
    .trim()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ حرف باشد"),
  phone: z.preprocess(
    cleanDigits,
    z
      .string({ required_error: "شماره موبایل تحویل‌گیرنده الزامی است" })
      .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)")
  ),
  province: z
    .string({ required_error: "انتخاب استان الزامی است" })
    .min(2, "استان را انتخاب کنید"),
  city: z
    .string({ required_error: "انتخاب شهر الزامی است" })
    .min(2, "شهر را انتخاب کنید"),
  address: z
    .string({ required_error: "نشانی دقیق پستی الزامی است" })
    .trim()
    .min(10, "نشانی کامل پستی باید حداقل ۱۰ کاراکتر باشد"),
  postalCode: z.preprocess(
    cleanDigits,
    z
      .string({ required_error: "کد پستی ۱۰ رقمی الزامی است" })
      .regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم عددی باشد")
  ),
  shippingMethod: z.enum(["courier", "tipax", "post"], {
    required_error: "شیوه ارسال سفارش را انتخاب کنید",
  }),
  notes: z.string().optional().default(""),
  saveAddressToProfile: z.boolean().optional().default(true),
});
