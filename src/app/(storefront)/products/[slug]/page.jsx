import { ProductDetailView } from "@/components/storefront/product/product-detail-view";
import {
  SEED_BRANDS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
} from "@/mocks/seed-data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    return {
      title: "مشخصات و خرید قطعه جلوبندی | یدک‌جلوبندی",
      description:
        "مشاهده مشخصات فنی، جدول سازگاری خودرو و خرید آنلاین قطعات تخصصی جلوبندی در فروشگاه یدک‌جلوبندی.",
    };
  }

  const brand = SEED_BRANDS.find((b) => b.id === product.brandId);
  const category = SEED_CATEGORIES.find((c) => c.id === product.categoryId);

  return {
    title: `${product.title} | یدک‌جلوبندی`,
    description: `خرید آنلاین ${product.title}${
      brand ? ` برند ${brand.name}` : ""
    }${
      category ? ` از دسته ${category.name}` : ""
    } با ${product.warranty} و بررسی تطابق دقیق خودرو در یدک‌جلوبندی.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
