export const queryKeys = {
  products: {
    all: ["products"],
    list: (filters) => ["products", "list", filters || {}],
    detail: (slug) => ["products", "detail", slug],
  },
  catalog: {
    cars: ["catalog", "cars"],
    categories: ["catalog", "categories"],
    brands: ["catalog", "brands"],
    provinces: ["catalog", "provinces"],
  },
  orders: {
    all: ["orders"],
    my: ["orders", "my"],
    detail: (id) => ["orders", "detail", id],
  },
  settings: ["settings"],
  user: {
    profile: ["user", "profile"],
  },
};
