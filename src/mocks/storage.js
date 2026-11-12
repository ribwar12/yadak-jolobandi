import {
  DB_VERSION,
  SEED_BRANDS,
  SEED_CARS,
  SEED_CAR_FAMILIES,
  SEED_CATEGORIES,
  SEED_MANUFACTURERS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_PROVINCES,
  SEED_SETTINGS,
  SEED_USERS,
} from "./seed-data";

const STORAGE_KEYS = {
  version: "yadak_db_version",
  products: "yadak_products",
  users: "yadak_users",
  orders: "yadak_orders",
  settings: "yadak_settings",
  cars: "yadak_cars",
  carFamilies: "yadak_car_families",
  manufacturers: "yadak_manufacturers",
  categories: "yadak_categories",
  brands: "yadak_brands",
};

const IN_MEMORY_FALLBACK = {
  products: SEED_PRODUCTS,
  users: SEED_USERS,
  orders: SEED_ORDERS,
  settings: SEED_SETTINGS,
  cars: SEED_CARS,
  carFamilies: SEED_CAR_FAMILIES,
  manufacturers: SEED_MANUFACTURERS,
  categories: SEED_CATEGORIES,
  brands: SEED_BRANDS,
  provinces: SEED_PROVINCES,
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function ensureSeeded() {
  if (!isBrowser()) return;

  try {
    const currentVersion = window.localStorage.getItem(STORAGE_KEYS.version);
    if (currentVersion !== DB_VERSION) {
      window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(SEED_PRODUCTS));
      window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(SEED_USERS));
      window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(SEED_ORDERS));
      window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(SEED_SETTINGS));
      window.localStorage.setItem(STORAGE_KEYS.cars, JSON.stringify(SEED_CARS));
      window.localStorage.setItem(STORAGE_KEYS.carFamilies, JSON.stringify(SEED_CAR_FAMILIES));
      window.localStorage.setItem(STORAGE_KEYS.manufacturers, JSON.stringify(SEED_MANUFACTURERS));
      window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(SEED_CATEGORIES));
      window.localStorage.setItem(STORAGE_KEYS.brands, JSON.stringify(SEED_BRANDS));
      window.localStorage.setItem(STORAGE_KEYS.version, DB_VERSION);
    }
  } catch (err) {
    console.error("Failed to seed localStorage:", err);
  }
}

export function getCollection(name) {
  if (name === "provinces") {
    return clone(SEED_PROVINCES);
  }

  if (!isBrowser()) {
    return clone(IN_MEMORY_FALLBACK[name] ?? null);
  }

  ensureSeeded();

  try {
    const storageKey = STORAGE_KEYS[name];
    if (!storageKey) return clone(IN_MEMORY_FALLBACK[name] ?? null);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return clone(IN_MEMORY_FALLBACK[name] ?? null);
    return JSON.parse(raw);
  } catch {
    return clone(IN_MEMORY_FALLBACK[name] ?? null);
  }
}

export function setCollection(name, data) {
  if (!isBrowser()) return data;

  ensureSeeded();

  const storageKey = STORAGE_KEYS[name];
  if (storageKey) {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
  return clone(data);
}

export function resetMockDb() {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
  ensureSeeded();
}

export function simulateNetworkDelay(ms = 180) {
  if (!isBrowser()) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
