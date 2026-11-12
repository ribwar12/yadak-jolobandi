import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils";

const cleanDigits = (val) =>
  typeof val === "string" ? toEnglishDigits(val.trim()) : val;

export const profileSchema = z.object({
  fullName: z
    .string({ required_error: "نام و نام خانوادگی الزامی است" })
    .trim()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ حرف باشد"),
  province: z.string().min(2, "استان را مشخص کنید"),
  city: z.string().min(2, "شهر را مشخص کنید"),
  address: z
    .string()
    .trim()
    .min(10, "نشانی پستی باید حداقل ۱۰ کاراکتر باشد"),
  postalCode: z.preprocess(
    cleanDigits,
    z.string().regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم عددی باشد")
  ),
});
