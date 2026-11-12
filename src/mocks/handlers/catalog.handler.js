import { getCollection } from "../storage";

export const catalogHandlers = {
  getCars() {
    const families = getCollection("carFamilies") || [];
    const cars = getCollection("cars") || [];
    const manufacturers = getCollection("manufacturers") || [];
    const products = (getCollection("products") || []).filter((p) => p.isActive !== false);

    const enrichedCars = cars.map((car) => {
      const productCount = products.filter((p) =>
        Array.isArray(p.compatibleCarIds) && p.compatibleCarIds.includes(car.id)
      ).length;
      return { ...car, productCount };
    });

    const enrichedFamilies = families.map((fam) => {
      const famCarIds = fam.models.map((m) => m.id);
      const productCount = products.filter((p) =>
        Array.isArray(p.compatibleCarIds) && p.compatibleCarIds.some((id) => famCarIds.includes(id))
      ).length;
      const models = fam.models.map((m) => {
        const match = enrichedCars.find((c) => c.id === m.id);
        return match || { ...m, productCount: 0 };
      });
      return { ...fam, productCount, models };
    });

    return {
      manufacturers,
      families: enrichedFamilies,
      cars: enrichedCars,
    };
  },

  getCategories() {
    const categories = getCollection("categories") || [];
    const products = (getCollection("products") || []).filter((p) => p.isActive !== false);

    return categories.map((cat) => ({
      ...cat,
      productCount: products.filter((p) => p.categoryId === cat.id).length,
    }));
  },

  getBrands() {
    const brands = getCollection("brands") || [];
    const products = (getCollection("products") || []).filter((p) => p.isActive !== false);

    return brands.map((brand) => ({
      ...brand,
      productCount: products.filter((p) => p.brandId === brand.id).length,
    }));
  },

  getProvinces() {
    return getCollection("provinces") || [];
  },
};
