import { ApiError } from "@/lib/api-error";
import { getCollection } from "../storage";

function enrichProduct(product, { categories, brands, cars }) {
  const category = categories.find((c) => c.id === product.categoryId) || null;
  const brand = brands.find((b) => b.id === product.brandId) || null;
  const compatibleCars = (product.compatibleCarIds || [])
    .map((id) => cars.find((c) => c.id === id))
    .filter(Boolean);

  const effectivePrice =
    product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  return {
    ...product,
    effectivePrice,
    discountPercent,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    brand: brand
      ? {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          country: brand.country,
          isOriginalCompany: brand.isOriginalCompany,
        }
      : null,
    compatibleCars,
  };
}

export const productsHandlers = {
  getProducts(params = {}) {
    const rawProducts = getCollection("products") || [];
    const categories = getCollection("categories") || [];
    const brands = getCollection("brands") || [];
    const cars = getCollection("cars") || [];
    const carFamilies = getCollection("carFamilies") || [];

    const includeInactive = params.includeInactive === true || params.includeInactive === "true";

    let list = rawProducts
      .filter((p) => (includeInactive ? true : p.isActive !== false))
      .map((p) => enrichProduct(p, { categories, brands, cars }));

    // Search query
    const q = (params.q || params.search || "").toString().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand?.name || "").toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q)
      );
    }

    // Car or Car Family filter
    const carFilter = (params.car || params.carId || "").toString().trim();
    if (carFilter) {
      const family = carFamilies.find((f) => f.id === carFilter || f.slug === carFilter);
      if (family) {
        const familyModelIds = family.models.map((m) => m.id);
        list = list.filter((p) =>
          p.compatibleCarIds.some((id) => familyModelIds.includes(id))
        );
      } else {
        const matchedCar = cars.find((c) => c.id === carFilter || c.slug === carFilter);
        const targetCarId = matchedCar ? matchedCar.id : carFilter;
        list = list.filter((p) => p.compatibleCarIds.includes(targetCarId));
      }
    }

    // Category filter (supports id, slug, or comma-separated)
    const categoryParam = (params.category || params.categoryId || "").toString().trim();
    if (categoryParam) {
      const tokens = categoryParam.split(",").map((s) => s.trim()).filter(Boolean);
      const matchedCatIds = categories
        .filter((c) => tokens.includes(c.id) || tokens.includes(c.slug))
        .map((c) => c.id);
      list = list.filter((p) => matchedCatIds.includes(p.categoryId) || tokens.includes(p.categoryId));
    }

    // Brand filter (supports id, slug, or comma-separated)
    const brandParam = (params.brand || params.brandId || "").toString().trim();
    if (brandParam) {
      const tokens = brandParam.split(",").map((s) => s.trim()).filter(Boolean);
      const matchedBrandIds = brands
        .filter((b) => tokens.includes(b.id) || tokens.includes(b.slug))
        .map((b) => b.id);
      list = list.filter((p) => matchedBrandIds.includes(p.brandId) || tokens.includes(p.brandId));
    }

    // In stock filter
    if (params.inStock === true || params.inStock === "true") {
      list = list.filter((p) => p.stock > 0);
    }

    // Only bundles filter
    if (params.onlyBundles === true || params.onlyBundles === "true" || params.isBundle === true || params.isBundle === "true") {
      list = list.filter((p) => p.isBundle === true);
    }

    // Featured filter
    if (params.featured === true || params.featured === "true") {
      list = list.filter((p) => p.isFeatured === true);
    }

    // Position filter
    if (params.position) {
      const pos = params.position.toString().trim();
      list = list.filter((p) => (p.position || "").includes(pos));
    }

    // Price range filter
    if (params.minPrice !== undefined && params.minPrice !== "" && !isNaN(Number(params.minPrice))) {
      const min = Number(params.minPrice);
      list = list.filter((p) => p.effectivePrice >= min);
    }
    if (params.maxPrice !== undefined && params.maxPrice !== "" && !isNaN(Number(params.maxPrice))) {
      const max = Number(params.maxPrice);
      list = list.filter((p) => p.effectivePrice <= max);
    }

    // Sorting
    const sort = (params.sort || "bestselling").toString();
    list.sort((a, b) => {
      if (sort === "price_asc") return a.effectivePrice - b.effectivePrice;
      if (sort === "price_desc") return b.effectivePrice - a.effectivePrice;
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "discount") return b.discountPercent - a.discountPercent;
      return (b.salesCount || 0) - (a.salesCount || 0);
    });

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.pageSize) || 12);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  getProductBySlug(slugOrId) {
    const rawProducts = getCollection("products") || [];
    const categories = getCollection("categories") || [];
    const brands = getCollection("brands") || [];
    const cars = getCollection("cars") || [];

    const found = rawProducts.find(
      (p) => (p.slug === slugOrId || p.id === slugOrId) && p.isActive !== false
    );

    if (!found) {
      throw new ApiError({
        status: 404,
        code: "PRODUCT_NOT_FOUND",
        message: "قطعه مورد نظر در کاتالوگ یافت نشد",
      });
    }

    const product = enrichProduct(found, { categories, brands, cars });

    // Build compatibility matrix rows (compatible cars + 1 incompatible reference row for clarity)
    const compatibleRows = product.compatibleCars.map((car) => ({
      carId: car.id,
      carName: car.name,
      engine: car.engine,
      years: car.years,
      position: product.position,
      isCompatible: true,
    }));

    const incompatibleSample = cars.find((c) => !product.compatibleCarIds.includes(c.id));
    const compatibilityMatrix = incompatibleSample
      ? [
          ...compatibleRows,
          {
            carId: incompatibleSample.id,
            carName: incompatibleSample.name,
            engine: incompatibleSample.engine,
            years: incompatibleSample.years,
            position: product.position,
            isCompatible: false,
          },
        ]
      : compatibleRows;

    // Related products (same compatible cars or same category)
    const relatedProducts = rawProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          p.isActive !== false &&
          (p.categoryId === product.categoryId ||
            p.compatibleCarIds.some((id) => product.compatibleCarIds.includes(id)))
      )
      .slice(0, 4)
      .map((p) => enrichProduct(p, { categories, brands, cars }));

    return {
      product,
      compatibilityMatrix,
      relatedProducts,
    };
  },
};
