"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCars, useCategories } from "@/hooks/queries/use-catalog";
import { formatNumber } from "@/lib/utils";
import { useCarStore } from "@/store/use-car-store";

export function CarFinderSection() {
  const router = useRouter();
  const { data: carsData } = useCars();
  const { data: categories } = useCategories();
  const setSelectedCar = useCarStore((s) => s.setSelectedCar);

  const [manufacturerId, setManufacturerId] = useState("");
  const [carId, setCarId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const manufacturers = carsData?.manufacturers || [];
  const allCars = carsData?.cars || [];
  const filteredCars = manufacturerId
    ? allCars.filter((c) => c.manufacturerId === manufacturerId)
    : allCars;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (carId) {
      const chosenCar = allCars.find((c) => c.id === carId);
      if (chosenCar) {
        setSelectedCar(chosenCar);
      }
      params.set("car", carId);
    }

    if (categorySlug) {
      params.set("category", categorySlug);
    }

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <section className="container mx-auto px-4 mt-4 md:mt-6 relative z-10">
      <div className="rounded-2xl border border-slate-800 border-t-4 border-t-accent bg-slate-900 p-4 sm:p-6 shadow-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                جستجوی قطعات بر اساس مدل خودرو
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                فیلتر هوشمند و تضمین ۱۰۰٪ تطابق قطعه با شاسی و اکسل خودرو
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-orange-300 border border-slate-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            تضمین اصالت و عدم لرزش فرمان
          </span>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          {/* ۱. انتخاب خودروساز */}
          <div className="space-y-1.5">
            <label
              htmlFor="finder-manufacturer"
              className="block text-xs font-bold text-slate-300"
            >
              ۱. سازنده خودرو:
            </label>
            <select
              id="finder-manufacturer"
              value={manufacturerId}
              onChange={(e) => {
                setManufacturerId(e.target.value);
                setCarId("");
              }}
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs sm:text-sm font-medium text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">همه سازندگان (ایران‌خودرو، سایپا...)</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* ۲. انتخاب مدل و تیپ خودرو */}
          <div className="space-y-1.5">
            <label
              htmlFor="finder-car"
              className="block text-xs font-bold text-slate-300"
            >
              ۲. مدل و تیپ خودرو:
            </label>
            <select
              id="finder-car"
              value={carId}
              onChange={(e) => setCarId(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs sm:text-sm font-medium text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">انتخاب مدل خودرو...</option>
              {filteredCars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} ({formatNumber(car.productCount || 0)} قطعه)
                </option>
              ))}
            </select>
          </div>

          {/* ۳. انتخاب نوع قطعه */}
          <div className="space-y-1.5">
            <label
              htmlFor="finder-category"
              className="block text-xs font-bold text-slate-300"
            >
              ۳. نوع قطعه جلوبندی:
            </label>
            <select
              id="finder-category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs sm:text-sm font-medium text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">همه قطعات تعلیق و جلوبندی</option>
              {(categories || []).map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name} ({formatNumber(cat.productCount || 0)})
                </option>
              ))}
            </select>
          </div>

          {/* دکمه جستجو */}
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="h-11 w-full gap-2 font-black text-sm"
          >
            <Search className="h-4 w-4" />
            <span>نمایش قطعات سازگار</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
