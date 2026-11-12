import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function toEnglishDigits(str) {
  if (str === null || str === undefined) return "";
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return str
    .toString()
    .replace(/[۰-۹]/g, (w) => farsiDigits.indexOf(w))
    .replace(/[٠-٩]/g, (w) => arabicDigits.indexOf(w));
}

export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return "۰ تومان";
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "۰";
  return new Intl.NumberFormat("fa-IR").format(num);
}
