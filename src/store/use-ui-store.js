import { create } from "zustand";

export const useUiStore = create((set) => ({
  isCartDrawerOpen: false,
  isCarSelectorOpen: false,
  isMobileNavOpen: false,

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: Boolean(open) }),

  openCarSelector: () => set({ isCarSelectorOpen: true }),
  closeCarSelector: () => set({ isCarSelectorOpen: false }),
  setCarSelectorOpen: (open) => set({ isCarSelectorOpen: Boolean(open) }),

  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: Boolean(open) }),
}));
