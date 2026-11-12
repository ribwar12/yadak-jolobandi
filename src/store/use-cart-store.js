import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { useUiStore } from "./use-ui-store";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, { openDrawer = true } = {}) => {
        if (!product || !product.id) return;

        const maxStock = typeof product.stock === "number" ? product.stock : 99;
        if (maxStock <= 0) {
          toast.error("این قطعه در حال حاضر در انبار موجود نیست");
          return;
        }

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.productId === product.id
        );

        const unitPrice = Number(product.price) || 0;
        const effectivePrice =
          product.discountPrice && product.discountPrice < product.price
            ? Number(product.discountPrice)
            : unitPrice;

        if (existingIndex > -1) {
          const existing = currentItems[existingIndex];
          const nextQty = Math.min(maxStock, existing.quantity + quantity);
          if (nextQty === existing.quantity) {
            toast.warning(`حداکثر موجودی قابل سفارش (${maxStock} عدد) در سبد شما قرار دارد`);
            return;
          }

          const updated = [...currentItems];
          updated[existingIndex] = {
            ...existing,
            quantity: nextQty,
            price: unitPrice,
            discountPrice: product.discountPrice || null,
            effectivePrice,
            stock: maxStock,
          };
          set({ items: updated });
        } else {
          const initialQty = Math.min(maxStock, Math.max(1, quantity));
          const snapshot = {
            productId: product.id,
            slug: product.slug,
            title: product.title,
            sku: product.sku,
            image: product.images?.[0] || "/images/products/suspension-pack.svg",
            brandName: product.brand?.name || "شرکتی",
            warranty: product.warranty || "۱۲ ماه ضمانت تعویض",
            position: product.position || "",
            compatibleCarIds: product.compatibleCarIds || [],
            isBundle: Boolean(product.isBundle),
            price: unitPrice,
            discountPrice: product.discountPrice || null,
            effectivePrice,
            stock: maxStock,
            quantity: initialQty,
          };
          set({ items: [...currentItems, snapshot] });
        }

        toast.success("قطعه به سبد خرید اضافه شد", {
          description: product.title,
        });

        if (openDrawer) {
          useUiStore.getState().openCartDrawer();
        }
      },

      updateQuantity: (productId, nextQuantity) => {
        const currentItems = get().items;
        const target = currentItems.find((i) => i.productId === productId);
        if (!target) return;

        if (nextQuantity <= 0) {
          set({ items: currentItems.filter((i) => i.productId !== productId) });
          return;
        }

        const maxStock = typeof target.stock === "number" ? target.stock : 99;
        if (nextQuantity > maxStock) {
          toast.warning(`حداکثر موجودی انبار برای این قطعه ${maxStock} عدد است`);
          return;
        }

        set({
          items: currentItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity: nextQuantity }
              : item
          ),
        });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      syncItemsWithCatalog: (freshProducts = []) => {
        if (!Array.isArray(freshProducts) || freshProducts.length === 0) return;
        const currentItems = get().items;
        const synced = currentItems
          .map((item) => {
            const fresh = freshProducts.find((p) => p.id === item.productId);
            if (!fresh) return item;
            const unitPrice = Number(fresh.price) || item.price;
            const effectivePrice =
              fresh.discountPrice && fresh.discountPrice < fresh.price
                ? Number(fresh.discountPrice)
                : unitPrice;
            return {
              ...item,
              title: fresh.title,
              price: unitPrice,
              discountPrice: fresh.discountPrice || null,
              effectivePrice,
              stock: fresh.stock,
              quantity: Math.min(item.quantity, Math.max(1, fresh.stock || 1)),
            };
          });
        set({ items: synced });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "yadak_cart_storage",
    }
  )
);

export function getCartTotals(items = [], settings = {}) {
  const totalCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const subtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0
  );
  const payableItemsTotal = items.reduce(
    (acc, item) => acc + (item.effectivePrice || item.price || 0) * (item.quantity || 0),
    0
  );
  const discountTotal = Math.max(0, subtotal - payableItemsTotal);

  const freeShippingThreshold = Number(settings?.freeShippingThreshold) || 3500000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - payableItemsTotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((payableItemsTotal / freeShippingThreshold) * 100)
  );
  const isFreeShipping = payableItemsTotal >= freeShippingThreshold && payableItemsTotal > 0;

  return {
    totalCount,
    subtotal,
    payableItemsTotal,
    discountTotal,
    freeShippingThreshold,
    remainingForFreeShipping,
    freeShippingProgress,
    isFreeShipping,
  };
}
