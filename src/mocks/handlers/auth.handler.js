import { ApiError } from "@/lib/api-error";
import { toEnglishDigits } from "@/lib/utils";
import { getCollection, setCollection } from "../storage";

function sanitizeUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function getUserFromToken(token) {
  if (!token || typeof token !== "string") return null;
  const userId = token.replace(/^Bearer\s+/i, "").replace(/^mock_jwt_/, "");
  const users = getCollection("users") || [];
  return sanitizeUser(users.find((u) => u.id === userId) || null);
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
  register(body = {}) {
    const username = (body.username || "").toString().trim();
    const phone = toEnglishDigits(body.phone || "").trim();
    const password = (body.password || "").toString();
    const confirmPassword = (body.confirmPassword || "").toString();

    if (username.length < 3) {
      throw new ApiError({
        status: 400,
        code: "INVALID_USERNAME",
        message: "نام کاربری باید حداقل ۳ کاراکتر باشد",
      });
    }

    if (!/^09\d{9}$/.test(phone)) {
      throw new ApiError({
        status: 400,
        code: "INVALID_PHONE",
        message: "شماره موبایل واردشده معتبر نیست",
      });
    }

    if (password.length < 6) {
      throw new ApiError({
        status: 400,
        code: "WEAK_PASSWORD",
        message: "رمز عبور باید حداقل ۶ کاراکتر باشد",
      });
    }

    if (password !== confirmPassword) {
      throw new ApiError({
        status: 400,
        code: "PASSWORD_MISMATCH",
        message: "رمز عبور و تکرار آن یکسان نیستند",
      });
    }

    const users = getCollection("users") || [];
    const duplicate = users.find(
      (u) =>
        u.phone === phone ||
        (u.username && u.username.toLowerCase() === username.toLowerCase())
    );

    if (duplicate) {
      throw new ApiError({
        status: 409,
        code: "USER_EXISTS",
        message: "این نام کاربری یا شماره موبایل قبلاً ثبت شده است",
      });
    }

    const newUser = {
      id: `user_${Date.now()}`,
      username,
      fullName: username,
      phone,
      password,
      role: "customer",
      province: "",
      city: "",
      address: "",
      postalCode: "",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setCollection("users", users);

    return {
      token: `mock_jwt_${newUser.id}`,
      user: sanitizeUser(newUser),
    };
  },

  login(body = {}) {
    const username = (body.username || "").toString().trim();
    const phone = toEnglishDigits(body.phone || "").trim();
    const password = (body.password || "").toString();

    if (!username || !password || !/^09\d{9}$/.test(phone)) {
      throw new ApiError({
        status: 400,
        code: "INVALID_CREDENTIALS_FORMAT",
        message: "لطفاً نام کاربری، شماره موبایل معتبر و رمز عبور را وارد کنید",
      });
    }

    const users = getCollection("users") || [];
    const matched = users.find(
      (u) =>
        u.phone === phone &&
        (u.username || "").toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!matched) {
      throw new ApiError({
        status: 401,
        code: "INVALID_CREDENTIALS",
        message: "نام کاربری، شماره موبایل یا رمز عبور اشتباه است",
      });
    }

    return {
      token: `mock_jwt_${matched.id}`,
      user: sanitizeUser(matched),
    };
  },

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
    return sanitizeUser(updated);
  },
};
