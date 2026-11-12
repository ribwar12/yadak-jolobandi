# سند قرارداد وب‌سرویس (REST API Contract) — فروشگاه یدک‌جلوبندی

تمامی سرویس‌های فرانت‌اند (`src/services/*.service.js`) از طریق `apiClient` درخواست‌های استاندارد REST ارسال می‌کنند.
برای اتصال به بک‌اند واقعی کافی است در فایل `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://api.yourdomain.ir/v1
```

---

## ۱. استانداردهای عمومی قرارداد داده

* **احراز هویت:** ارسال هدر `Authorization: Bearer <token>` در صورت لاگین بودن کاربر.
* **فرمت مبالغ:** عدد صحیح به **تومان** (`integer`).
* **فرمت تاریخ‌ها:** رشته استاندارد `ISO 8601` (مانند `"2026-02-10T18:42:00Z"`).
* **ساختار خطاها (HTTP 4xx / 5xx):**
  ```json
  {
    "code": "INSUFFICIENT_STOCK",
    "message": "موجودی انبار برای این قطعه کافی نیست",
    "details": null
  }
  ```

---

## ۲. فهرست Endpointهای بخش فروشگاه (Storefront)

### ۲.۱. کاتالوگ پایه (`Catalog`)

| متد | مسیر | توضیح | خروجی |
| :--- | :--- | :--- | :--- |
| `GET` | `/catalog/cars` | دریافت سازندگان، خانواده‌های خودرو و مدل‌ها به همراه تعداد قطعات سازگار (`productCount`) | `{ manufacturers, families, cars }` |
| `GET` | `/catalog/categories` | دریافت دسته‌بندی‌های قطعات تعلیق و جلوبندی به همراه `productCount` | `Array<Category>` |
| `GET` | `/catalog/brands` | دریافت برندهای تولیدکننده به همراه `productCount` | `Array<Brand>` |
| `GET` | `/catalog/provinces` | دریافت لیست ۳۱ استان ایران و شهرهای اصلی هر استان | `Array<{ id, name, cities: string[] }>` |

---

### ۲.۲. محصولات (`Products`)

#### `GET /products`
پارامترهای Query:
* `q` (اختیاری): عبارت جستجو در عنوان، کد فنی (`sku`)، برند یا دسته‌بندی
* `car` (اختیاری): شناسه یا اسلاگ خودرو (`car_206_t5`) یا خانواده خودرو (`fam_206`)
* `category` (اختیاری): شناسه یا اسلاگ دسته‌بندی (پشتیبانی از چند مقدار جداشده با ویرگول)
* `brand` (اختیاری): شناسه یا اسلاگ برند (پشتیبانی از چند مقدار جداشده با ویرگول)
* `inStock` (اختیاری): `"true"` برای نمایش فقط کالاهای موجود (`stock > 0`)
* `onlyBundles` (اختیاری): `"true"` برای نمایش فقط پک‌های کامل جلوبندی (`isBundle === true`)
* `featured` (اختیاری): `"true"` برای نمایش کالاهای منتخب
* `position` (اختیاری): فیلتر موقعیت نصب روی خودرو
* `minPrice` / `maxPrice` (اختیاری): محدوده قیمت مؤثر به تومان
* `sort` (اختیاری): `bestselling` | `newest` | `price_asc` | `price_desc` | `discount`
* `page` (پیش‌فرض `1`) و `pageSize` (پیش‌فرض `12`)

نمونه پاسخ:
```json
{
  "items": [
    {
      "id": "prod_1",
      "title": "پک کامل جلوبندی پژو ۲۰۶ تیپ ۲ و ۵ شرکتی (۱۰ تکه صادراتی امیرنیا)",
      "slug": "peugeot-206-full-suspension-pack-amirnia",
      "sku": "IR-206-SUSP-01",
      "price": 4850000,
      "discountPrice": 4490000,
      "effectivePrice": 4490000,
      "discountPercent": 7,
      "stock": 28,
      "isBundle": true,
      "bundleItems": ["..."],
      "warranty": "۱۲ ماه ضمانت کتبی تعویض بی‌قیدوشرط",
      "position": "محور جلو - هر دو سمت (راننده و شاگرد)",
      "images": ["/images/products/suspension-pack.svg"],
      "category": { "id": "cat_pack", "name": "پک کامل جلوبندی", "slug": "full-suspension-packs" },
      "brand": { "id": "brand_amirnia", "name": "امیرنیا (Amirnia)", "slug": "amirnia", "isOriginalCompany": true },
      "compatibleCars": [{ "id": "car_206_t2", "name": "پژو ۲۰۶ تیپ ۲ و ۳" }]
    }
  ],
  "total": 24,
  "page": 1,
  "pageSize": 12,
  "totalPages": 2
}
```

#### `GET /products/:slug`
دریافت جزئیات کامل یک محصول به همراه جدول ماتریس سازگاری و محصولات مشابه:
* پاسخ: `{ product, compatibilityMatrix, relatedProducts }`
* کد خطا در صورت نبود کالا: `404 PRODUCT_NOT_FOUND`

---

### ۲.۳. احراز هویت و حساب کاربری (`Auth & Profile`)

| متد | مسیر | بدنه درخواست | پاسخ |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/otp/request` | `{ "phone": "09123456789" }` | `{ "phone": "09123456789", "expiresIn": 120, "message": "..." }` |
| `POST` | `/auth/otp/verify` | `{ "phone": "09123456789", "code": "12345" }` | `{ "token": "...", "user": { "id", "fullName", "phone", "role", "province", "city", "address", "postalCode" } }` |
| `GET` | `/me` | — (نیازمند توکن) | شیء کامل `user` |
| `PATCH` | `/me` | `{ "fullName", "province", "city", "address", "postalCode" }` | شیء بروزرسانی‌شده `user` |

---

### ۲.۴. سفارشات و درگاه پرداخت (`Orders & Payment`)

#### `POST /orders` (نیازمند توکن)
* بررسی می‌کند که `settings.priceUpdateMode` فعال نباشد (در صورت فعال بودن: خطای `409 PRICE_UPDATE_MODE_ACTIVE`).
* قیمت و موجودی تک‌تک اقلام را سمت سرور مجدداً محاسبه و اعتبارسنجی می‌کند.
* در صورت فعال بودن `saveAddressToProfile`، آدرس مشتری را در پروفایل او ذخیره می‌کند.
* پاسخ:
  ```json
  {
    "order": { "id": "YDK-984210", "status": "pending_payment", "payableAmount": 4490000, "..." : "..." },
    "paymentUrl": "/payment/mock-gateway?orderId=YDK-984210"
  }
  ```

#### `POST /payments/mock/callback` (نیازمند توکن)
* بدنه: `{ "orderId": "YDK-984210", "success": true }`
* در صورت موفقیت، وضعیت سفارش را به `processing` و `paymentStatus: "paid"` تغییر داده و موجودی انبار را کسر می‌کند.

#### `GET /me/orders` (نیازمند توکن)
* دریافت لیست تمام سفارش‌های کاربر جاری به ترتیب جدیدترین.

#### `GET /orders/:id` (نیازمند توکن)
* دریافت جزئیات کامل سفارش (فقط برای صاحب سفارش یا نقش `admin` مجاز است).

---

### ۲.۵. تنظیمات سراسری سایت (`Settings`)

* `GET /settings`: دریافت تنظیمات عمومی فروشگاه، روش‌های ارسال، سقف ارسال رایگان و وضعیت نوسان بازار (`priceUpdateMode`).
* `PATCH /settings`: بروزرسانی تنظیمات فروشگاه (مورد استفاده در پنل مدیریت).
