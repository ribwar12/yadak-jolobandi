"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMyOrders } from "@/hooks/queries/use-orders";
import { useVerifyOtp } from "@/hooks/queries/use-auth";
import { useBrands, useCars, useCategories, useProvinces } from "@/hooks/queries/use-catalog";
import { useProducts } from "@/hooks/queries/use-products";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/queries/use-settings";
import { formatNumber, formatPrice } from "@/lib/utils";
import { resetMockDb } from "@/mocks/storage";
import { useAuthStore } from "@/store/use-auth-store";

export default function DataCheckPage() {
  const [filters, setFilters] = useState({
    q: "",
    car: "",
    category: "",
    brand: "",
    onlyBundles: false,
    inStock: false,
    sort: "bestselling",
    page: 1,
    pageSize: 6,
  });

  const { data: settings, isLoading: loadingSettings } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const { data: carsData } = useCars();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: provinces } = useProvinces();
  const { data: productsData, isLoading: loadingProducts } = useProducts(filters);

  const { user, isAuthenticated, logout } = useAuthStore();
  const verifyOtp = useVerifyOtp();
  const { data: myOrders } = useMyOrders();

  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Badge variant="accent" className="mb-2">
            فاز ۲ — بررسی لایه داده، سرویس‌ها و روتر Mock
          </Badge>
          <h1 className="text-2xl font-black text-slate-900">
            پنل تست و بازبینی معماری داده (`/dev/data-check`)
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetMockDb();
              window.location.reload();
            }}
          >
            ریست دیتابیس آزمایشی (Seed Reset)
          </Button>
        </div>
      </div>

      {/* ردیف ۱: آمار کاتالوگ و تنظیمات سایت */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">خانواده و مدل خودروها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatNumber(carsData?.families?.length || 0)} خانواده /{" "}
              {formatNumber(carsData?.cars?.length || 0)} تیپ
            </div>
            <p className="text-xs text-slate-500 mt-1">
              سازندگان: {carsData?.manufacturers?.map((m) => m.name).join("، ")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">دسته‌بندی و برندها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatNumber(categories?.length || 0)} دسته /{" "}
              {formatNumber(brands?.length || 0)} برند
            </div>
            <p className="text-xs text-slate-500 mt-1">
              استان‌های فعال: {formatNumber(provinces?.length || 0)} استان
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">وضعیت نوسان بازار (Settings)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                {settings?.priceUpdateMode ? "قفل موقت خرید فعال" : "فروشگاه در حالت عادی"}
              </span>
              <Switch
                checked={Boolean(settings?.priceUpdateMode)}
                disabled={loadingSettings || updateSettings.isPending}
                onCheckedChange={(checked) =>
                  updateSettings.mutate({ priceUpdateMode: checked })
                }
              />
            </div>
            <p className="text-xs text-slate-500">
              سقف ارسال رایگان: {formatPrice(settings?.freeShippingThreshold || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">تست احراز هویت و سفارش‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">
                    {user?.fullName || user?.phone} ({user?.role})
                  </span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    خروج
                  </Button>
                </div>
                <p className="text-xs text-slate-600">
                  تعداد سفارش‌های من: {formatNumber(myOrders?.length || 0)} سفارش
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() =>
                    verifyOtp.mutate({ phone: "09123456789", code: "12345" })
                  }
                >
                  ورود سریع مشتری
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    verifyOtp.mutate({ phone: "09120000000", code: "12345" })
                  }
                >
                  ورود سریع ادمین
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ردیف ۲: فیلتر زنده محصولات و صفحه‌بندی */}
      <Card>
        <CardHeader>
          <CardTitle>تست فیلترها، مرتب‌سازی و صفحه‌بندی (`GET /products`)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              placeholder="جستجوی نام قطعه یا کد فنی..."
              value={filters.q}
              onChange={(e) => handleFilterChange({ q: e.target.value })}
            />

            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={filters.car}
              onChange={(e) => handleFilterChange({ car: e.target.value })}
            >
              <option value="">همه خودروها</option>
              {carsData?.cars?.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} ({formatNumber(car.productCount)} قطعه)
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({formatNumber(cat.productCount)})
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={filters.brand}
              onChange={(e) => handleFilterChange({ brand: e.target.value })}
            >
              <option value="">همه برندها</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({formatNumber(b.productCount)})
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={filters.sort}
              onChange={(e) => handleFilterChange({ sort: e.target.value })}
            >
              <option value="bestselling">مرتب‌سازی: پرفروش‌ترین</option>
              <option value="newest">مرتب‌سازی: جدیدترین</option>
              <option value="price_asc">مرتب‌سازی: ارزان‌ترین</option>
              <option value="price_desc">مرتب‌سازی: گران‌ترین</option>
              <option value="discount">مرتب‌سازی: بیشترین تخفیف</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlyBundles}
                  onChange={(e) => handleFilterChange({ onlyBundles: e.target.checked })}
                />
                فقط پک‌های کامل جلوبندی
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                />
                فقط قطعات موجود در انبار
              </label>
            </div>

            <div className="text-sm font-bold text-slate-700">
              تعداد کل نتایج: {formatNumber(productsData?.total || 0)} قطعه (صفحه{" "}
              {formatNumber(productsData?.page || 1)} از{" "}
              {formatNumber(productsData?.totalPages || 1)})
            </div>
          </div>

          {loadingProducts ? (
            <div className="py-12 text-center text-slate-500">در حال بارگذاری قطعات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {productsData?.items?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={item.isBundle ? "accent" : "secondary"}>
                      {item.category?.name}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">{item.sku}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-600">
                    برند: <span className="font-semibold">{item.brand?.name}</span> | موجودی:{" "}
                    <span className={item.stock > 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                      {item.stock > 0 ? `${formatNumber(item.stock)} عدد` : "ناموجود"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {settings?.priceUpdateMode ? (
                      <Badge variant="warning">در حال بروزرسانی قیمت</Badge>
                    ) : (
                      <div>
                        {item.discountPrice && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            {formatNumber(item.price)}
                          </span>
                        )}
                        <span className="font-black text-orange-600">
                          {formatPrice(item.effectivePrice)}
                        </span>
                      </div>
                    )}
                    <Badge variant="outline">
                      {formatNumber(item.compatibleCars?.length || 0)} خودرو سازگار
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* صفحه‌بندی */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={(productsData?.page || 1) <= 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
            >
              صفحه قبل
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(productsData?.page || 1) >= (productsData?.totalPages || 1)}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              صفحه بعد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
