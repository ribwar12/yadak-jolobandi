import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCarStore = create(
  persist(
    (set) => ({
      selectedCar: null, // { id, name, slug, familyId, familyName, manufacturerId, engine, years }

      setSelectedCar: (car) =>
        set({
          selectedCar: car
            ? {
                id: car.id,
                name: car.name,
                slug: car.slug,
                familyId: car.familyId || null,
                familyName: car.familyName || null,
                manufacturerId: car.manufacturerId || null,
                engine: car.engine || null,
                years: car.years || null,
              }
            : null,
        }),

      clearSelectedCar: () => set({ selectedCar: null }),
    }),
    {
      name: "yadak_car_storage",
    }
  )
);
