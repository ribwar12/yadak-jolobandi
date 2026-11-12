import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils";

const cleanDigits = (val) =>
  typeof val === "string" ? toEnglishDigits(val.trim()) : val;

export const loginSchema = z.object({
  phone: z.preprocess(
    cleanDigits,
    z
      .string({ required_error: "شماره تلفن همراه را وارد کنید" })
      .min(1, "شماره تلفن همراه را وارد کنید")
      .regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم بوده و با ۰۹ آغاز شود")
  ),
});

export const verifyOtpSchema = z.object({
  code: z.preprocess(
    cleanDigits,
    z
      .string({ required_error: "کد تایید ۵ رقمی را وارد کنید" })
      .length(5, "کد تایید پیامکی باید دقیقاً ۵ رقم باشد")
      .regex(/^\d{5}$/, "کد تایید فقط شامل ارقام عددی است")
  ),
});
