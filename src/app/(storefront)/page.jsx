import { HeroSection } from "@/components/storefront/home/hero-section";
import { CarFinderSection } from "@/components/storefront/home/car-finder-section";
import { CarFamiliesSection } from "@/components/storefront/home/car-families-section";
import { BundlesSection } from "@/components/storefront/home/bundles-section";
import { CategoriesSection } from "@/components/storefront/home/categories-section";
import { TrustSection } from "@/components/storefront/home/trust-section";
import { GuideCtaSection } from "@/components/storefront/home/guide-cta-section";

export const metadata = {
  title: "مرجع تخصصی قطعات جلوبندی و سیستم تعلیق خودرو",
  description:
    "خرید آنلاین پک کامل جلوبندی، طبق، بوش، سیبک، میل موج‌گیر و کمک‌فنر خودروهای ایران‌خودرو، سایپا و مونتاژی با ضمانت اصالت و تطابق فنی.",
};

export default function StorefrontHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <CarFinderSection />
      <CarFamiliesSection />
      <BundlesSection />
      <CategoriesSection />
      <TrustSection />
      <GuideCtaSection />
    </div>
  );
}
