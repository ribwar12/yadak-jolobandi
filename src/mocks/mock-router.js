import { ApiError } from "@/lib/api-error";
import { simulateNetworkDelay } from "./storage";
import { authHandlers } from "./handlers/auth.handler";
import { catalogHandlers } from "./handlers/catalog.handler";
import { ordersHandlers } from "./handlers/orders.handler";
import { productsHandlers } from "./handlers/products.handler";
import { settingsHandlers } from "./handlers/settings.handler";

export const mockRouter = {
  async handle({ method = "GET", path = "/", params = {}, body = {}, token = null }) {
    await simulateNetworkDelay(160);

    const upperMethod = method.toUpperCase();
    const cleanPath = path.replace(/^\/api/, "").replace(/\/+$/, "") || "/";

    // 1. Catalog endpoints
    if (upperMethod === "GET" && cleanPath === "/catalog/cars") {
      return catalogHandlers.getCars();
    }
    if (upperMethod === "GET" && cleanPath === "/catalog/categories") {
      return catalogHandlers.getCategories();
    }
    if (upperMethod === "GET" && cleanPath === "/catalog/brands") {
      return catalogHandlers.getBrands();
    }
    if (upperMethod === "GET" && cleanPath === "/catalog/provinces") {
      return catalogHandlers.getProvinces();
    }

    // 2. Products endpoints
    if (upperMethod === "GET" && cleanPath === "/products") {
      return productsHandlers.getProducts(params);
    }
    if (upperMethod === "GET" && cleanPath.startsWith("/products/")) {
      const slug = decodeURIComponent(cleanPath.slice("/products/".length));
      return productsHandlers.getProductBySlug(slug);
    }

    // 3. Settings endpoints
    if (upperMethod === "GET" && cleanPath === "/settings") {
      return settingsHandlers.getSettings();
    }
    if ((upperMethod === "PATCH" || upperMethod === "PUT") && cleanPath === "/settings") {
      return settingsHandlers.updateSettings(body);
    }

    // 4. Auth & Profile endpoints
    if (upperMethod === "POST" && cleanPath === "/auth/register") {
      return authHandlers.register(body);
    }
    if (upperMethod === "POST" && cleanPath === "/auth/login") {
      return authHandlers.login(body);
    }
    if (upperMethod === "POST" && cleanPath === "/auth/otp/request") {
      return authHandlers.requestOtp(body);
    }
    if (upperMethod === "POST" && cleanPath === "/auth/otp/verify") {
      return authHandlers.verifyOtp(body);
    }
    if (upperMethod === "GET" && cleanPath === "/me") {
      return authHandlers.getMe(token);
    }
    if (upperMethod === "PATCH" && cleanPath === "/me") {
      return authHandlers.updateMe(token, body);
    }

    // 5. Orders & Payments endpoints
    if (upperMethod === "POST" && cleanPath === "/orders") {
      return ordersHandlers.createOrder(token, body);
    }
    if (upperMethod === "GET" && cleanPath === "/me/orders") {
      return ordersHandlers.getMyOrders(token);
    }
    if (upperMethod === "POST" && cleanPath === "/orders/track") {
      return ordersHandlers.trackOrder(body);
    }
    if (upperMethod === "GET" && cleanPath.startsWith("/orders/")) {
      const orderId = decodeURIComponent(cleanPath.slice("/orders/".length));
      return ordersHandlers.getOrderById(token, orderId);
    }
    if (upperMethod === "POST" && cleanPath === "/payments/mock/callback") {
      return ordersHandlers.processMockPaymentCallback(token, body);
    }

    throw new ApiError({
      status: 404,
      code: "ROUTE_NOT_FOUND",
      message: `مسیر درخواستی یافت نشد: ${upperMethod} ${cleanPath}`,
    });
  },
};
