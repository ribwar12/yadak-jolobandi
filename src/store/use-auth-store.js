import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingPhone: null,
      otpExpiresAt: null,
      redirectAfterLogin: null,

      setPendingOtp: (phone, durationSeconds = 120, redirectPath = null) =>
        set({
          pendingPhone: phone,
          otpExpiresAt: Date.now() + durationSeconds * 1000,
          ...(redirectPath ? { redirectAfterLogin: redirectPath } : {}),
        }),

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(user && token),
          pendingPhone: null,
          otpExpiresAt: null,
        }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),

      clearRedirect: () => set({ redirectAfterLogin: null }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingPhone: null,
          otpExpiresAt: null,
        }),
    }),
    {
      name: "yadak_auth_storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingPhone: state.pendingPhone,
        otpExpiresAt: state.otpExpiresAt,
        redirectAfterLogin: state.redirectAfterLogin,
      }),
    }
  )
);
