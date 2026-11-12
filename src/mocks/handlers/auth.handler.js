import { ApiError } from "@/lib/api-error";
import { toEnglishDigits } from "@/lib/utils";
import { getCollection, setCollection } from "../storage";

export function getUserFromToken(token) {
  if (!token || typeof token !== "string") return null;
  const userId = token.replace(/^Bearer\s+/i, "").replace(/^mock_jwt_/, "");
  const users = getCollection("users") || [];
  return users.find((u) => u.id === userId) || null;
}

export function requireAuth(token, requiredRole = null) {
  const user = getUserFromToken(token);
  if (!user) {
    throw new ApiError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "نشست کاربری شما منقضی شده است؛ لطفاً دوباره وارد شوید",
    });
  }
  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    throw new ApiError({
      status: 403,
      code: "FORBIDDEN",
      message: "شما دسترسی لازم برای انجام این عملیات را ندارید",
    });
  }
  return user;
}

export const authHandlers = {
  requestOtp(body = {}) {
    const phone = toEnglishDigits(body.phone || "").trim();
    if (!/^09\d{9}$/.test(phone)) {
      throw new ApiError({
        status: 400,
        code: "INVALID_PHONE",
        message: "شماره موبایل واردشده معتبر نیست",
      });
    }

    return {
      phone,
      expiresIn: 120,
      mockOtpCode: "12345",
      message: "کد تایید ۵ رقمی به شماره همراه شما ارسال شد",
    };
  },

  verifyOtp(body = {}) {
    const phone = toEnglishDigits(body.phone || "").trim();
    const code = toEnglishDigits(body.code || "").trim();

    if (!/^09\d{9}$/.test(phone)) {
      throw new ApiError({
        status: 400,
        code: "INVALID_PHONE",
        message: "شماره موبایل نامعتبر است",
      });
    }

    if (code !== "12345") {
      throw new ApiError({
        status: 400,
        code: "INVALID_OTP",
        message: "کد تایید واردشده نادرست است (کد آزمایشی: ۱۲۳۴۵)",
      });
    }

    const users = getCollection("users") || [];
    let user = users.find((u) => u.phone === phone);

    if (!user) {
      user = {
        id: phone === "09120000000" ? "user_admin_1" : `user_${Date.now()}`,
        fullName: phone === "09120000000" ? "مدیر فنی یدک‌جلوبندی" : "",
        phone,
        role: phone === "09120000000" ? "admin" : "customer",
        province: "",
        city: "",
        address: "",
        postalCode: "",
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      setCollection("users", users);
    }

    const token = `mock_jwt_${user.id}`;
    return {
      token,
      user,
    };
  },

  getMe(token) {
    return requireAuth(token);
  },

  updateMe(token, body = {}) {
    const currentUser = requireAuth(token);
    const users = getCollection("users") || [];
    const idx = users.findIndex((u) => u.id === currentUser.id);

    if (idx === -1) {
      throw new ApiError({
        status: 404,
        code: "USER_NOT_FOUND",
        message: "کاربر یافت نشد",
      });
    }

    const updated = {
      ...users[idx],
      fullName: body.fullName !== undefined ? body.fullName.trim() : users[idx].fullName,
      province: body.province !== undefined ? body.province.trim() : users[idx].province,
      city: body.city !== undefined ? body.city.trim() : users[idx].city,
      address: body.address !== undefined ? body.address.trim() : users[idx].address,
      postalCode:
        body.postalCode !== undefined
          ? toEnglishDigits(body.postalCode).trim()
          : users[idx].postalCode,
    };

    users[idx] = updated;
    setCollection("users", users);
    return updated;
  },
};
