import { getCollection, setCollection } from "../storage";

export const settingsHandlers = {
  getSettings() {
    return getCollection("settings") || {};
  },

  updateSettings(body = {}) {
    const current = getCollection("settings") || {};
    const updated = {
      ...current,
      ...body,
    };
    return setCollection("settings", updated);
  },
};
