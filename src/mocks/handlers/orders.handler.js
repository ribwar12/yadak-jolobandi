import { ApiError } from "@/lib/api-error";
import { toEnglishDigits } from "@/lib/utils";
import { getCollection, setCollection } from "../storage";
import { requireAuth } from "./auth.handler";

export const ordersHandlers = {
  createOrder(token, body = {}) {
    const user = requireAuth(token);
    const settings = getCollection("settings") || {};

    if (settings.priceUpdateMode) {
      throw new ApiError({
        status: 409,
        code: "PRICE_UPDATE_MODE_ACTIVE",
        message:
          settings.priceUpdateMessage ||
          "فروشگاه در حال به‌روزرسانی قیمت‌ها است و امکان ثبت سفارش آنلاین موقتاً مسدود می‌باشد.",
      });
    }

    const requestedItems = Array.isArray(body.items) ? body.items : [];
    if (requestedItems.length === 0) {
      throw new ApiError({
        status: 400,
        code: "EMPTY_CART",
        message: "سبد خرید شما خالی است",
      });
    }

    const products = getCollection("products") || [];
    const brands = getCollection("brands") || [];

    let subtotal = 0;
    let payableItemsTotal = 0;
    const orderItems = [];

    for (const reqItem of requestedItems) {
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      const product = products.find(
        (p) => p.id === reqItem.productId && p.isActive !== false
      );

      if (!product) {
        throw new ApiError({
          status: 400,
          code: "PRODUCT_UNAVAILABLE",
          message: "یکی از قطعات سبد خرید دیگر در کاتالوگ موجود نیست",
        });
      }

      if (product.stock < qty) {
        throw new ApiError({
          status: 400,
          code: "INSUFFICIENT_STOCK",
          message: `موجودی انبار برای «${product.title}» کافی نیست (موجودی فعلی: ${product.stock} عدد)`,
        });
      }

      const brand = brands.find((b) => b.id === product.brandId);
      const unitPrice = product.price;
      const finalUnitPrice =
        product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      subtotal += unitPrice * qty;
      payableItemsTotal += finalUnitPrice * qty;

      orderItems.push({
        productId: product.id,
        title: product.title,
        sku: product.sku,
        brandName: brand ? brand.name : "شرکتی",
        warranty: product.warranty,
        image: product.images?.[0] || "/images/products/suspension-pack.svg",
        unitPrice,
        finalUnitPrice,
        quantity: qty,
        lineTotal: finalUnitPrice * qty,
      });
    }

    const discountTotal = subtotal - payableItemsTotal;
    const shippingMethods = settings.shippingMethods || [];
    const selectedMethod =
      shippingMethods.find((m) => m.id === body.shippingMethod) ||
      shippingMethods[0] || {
        id: "post",
        title: "پست پیشتاز سراسری",
        baseCost: 85000,
      };

    const freeThreshold = Number(settings.freeShippingThreshold) || 3500000;
    const shippingCost =
      payableItemsTotal >= freeThreshold ? 0 : Number(selectedMethod.baseCost) || 85000;
    const payableAmount = payableItemsTotal + shippingCost;

    const customerInfo = {
      fullName: (body.fullName || user.fullName || "").trim(),
      phone: toEnglishDigits(body.phone || user.phone || "").trim(),
      province: (body.province || user.province || "").trim(),
      city: (body.city || user.city || "").trim(),
      address: (body.address || user.address || "").trim(),
      postalCode: toEnglishDigits(body.postalCode || user.postalCode || "").trim(),
      notes: (body.notes || "").trim(),
    };

    // Seamless Onboarding: update user profile address
    if (body.saveAddressToProfile !== false) {
      const users = getCollection("users") || [];
      const uIdx = users.findIndex((u) => u.id === user.id);
      if (uIdx !== -1) {
        users[uIdx] = {
          ...users[uIdx],
          fullName: customerInfo.fullName || users[uIdx].fullName,
          province: customerInfo.province || users[uIdx].province,
          city: customerInfo.city || users[uIdx].city,
          address: customerInfo.address || users[uIdx].address,
          postalCode: customerInfo.postalCode || users[uIdx].postalCode,
        };
        setCollection("users", users);
      }
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderId = `YDK-${randomDigits}`;

    const newOrder = {
      id: orderId,
      userId: user.id,
      customer: customerInfo,
      items: orderItems,
      shippingMethod: selectedMethod.id,
      shippingMethodTitle: selectedMethod.title,
      subtotal,
      discountTotal,
      shippingCost,
      payableAmount,
      status: "pending_payment",
      paymentStatus: "pending",
      paymentRefId: null,
      postalTrackingCode: null,
      createdAt: new Date().toISOString(),
    };

    const orders = getCollection("orders") || [];
    orders.unshift(newOrder);
    setCollection("orders", orders);

    return {
      order: newOrder,
      paymentUrl: `/payment/mock-gateway?orderId=${encodeURIComponent(orderId)}`,
    };
  },

  processMockPaymentCallback(token, body = {}) {
    const user = requireAuth(token);
    const { orderId, success } = body;

    const orders = getCollection("orders") || [];
    const idx = orders.findIndex((o) => o.id === orderId);

    if (idx === -1) {
      throw new ApiError({
        status: 404,
        code: "ORDER_NOT_FOUND",
        message: "سفارش مورد نظر یافت نشد",
      });
    }

    const order = orders[idx];
    if (order.userId !== user.id && user.role !== "admin") {
      throw new ApiError({
        status: 403,
        code: "FORBIDDEN",
        message: "عدم دسترسی به این سفارش",
      });
    }

    if (order.paymentStatus === "paid") {
      return { order };
    }

    if (success) {
      // Deduct stock from products
      const products = getCollection("products") || [];
      for (const item of order.items) {
        const pIdx = products.findIndex((p) => p.id === item.productId);
        if (pIdx !== -1) {
          products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
          products[pIdx].salesCount = (products[pIdx].salesCount || 0) + item.quantity;
        }
      }
      setCollection("products", products);

      const refDigits = Math.floor(10000000 + Math.random() * 90000000);
      const postDigits = Math.floor(1000000000 + Math.random() * 9000000000);

      orders[idx] = {
        ...order,
        status: "processing",
        paymentStatus: "paid",
        paymentRefId: `SHP-${refDigits}`,
        postalTrackingCode: `2984510098${postDigits}`,
        paidAt: new Date().toISOString(),
      };
    } else {
      orders[idx] = {
        ...order,
        status: "cancelled",
        paymentStatus: "failed",
      };
    }

    setCollection("orders", orders);
    return { order: orders[idx] };
  },

  getMyOrders(token) {
    const user = requireAuth(token);
    const orders = getCollection("orders") || [];
    return orders
      .filter((o) => o.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getOrderById(token, orderId) {
    const user = requireAuth(token);
    const orders = getCollection("orders") || [];
    const normalizedId = (orderId || "").toString().trim().toUpperCase();
    const order = orders.find((o) => o.id.toUpperCase() === normalizedId);

    if (!order) {
      throw new ApiError({
        status: 404,
        code: "ORDER_NOT_FOUND",
        message: "سفارشی با این کد رهگیری یافت نشد",
      });
    }

    if (order.userId !== user.id && user.role !== "admin") {
      throw new ApiError({
        status: 403,
        code: "FORBIDDEN",
        message: "این سفارش متعلق به حساب کاربری شما نیست",
      });
    }

    return order;
  },

  trackOrder(body = {}) {
    const phone = toEnglishDigits(body.phone || "").trim();
    const orderId = toEnglishDigits(body.orderId || "").trim().toUpperCase();

    if (!/^09\d{9}$/.test(phone) || !orderId) {
      throw new ApiError({
        status: 400,
        code: "INVALID_TRACK_INPUT",
        message: "لطفاً شماره موبایل ۱۱ رقمی و کد سفارش معتبر را وارد کنید",
      });
    }

    const orders = getCollection("orders") || [];
    const matched = orders.find((o) => {
      const oPhone = toEnglishDigits(o.customer?.phone || "").trim();
      return o.id.toUpperCase() === orderId && oPhone === phone;
    });

    if (!matched) {
      throw new ApiError({
        status: 404,
        code: "ORDER_NOT_FOUND",
        message: "سفارشی با این شماره موبایل و کد رهگیری یافت نشد",
      });
    }

    return matched;
  },
};
