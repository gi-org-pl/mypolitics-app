import {
  VIEW_VISIT_STORAGE_KEY_PREFIX,
  VIEW_VISITED,
} from "@/constants/storage";

import { getSafeSessionStorage } from "./getSafeSessionStorage";

// Notes in this tab's session that the view of a route was opened, and says
// whether this was its first visit. It is the first visit only when the
// session had no note of the view and the note could be written: a browser
// that refuses the storage, or drops the write, would otherwise call every
// visit the first.
export const claimFirstViewVisit = (routeId: string): boolean => {
  const storage = getSafeSessionStorage();

  if (!storage) return false;

  const key = `${VIEW_VISIT_STORAGE_KEY_PREFIX}${routeId}`;

  if (storage.getItem(key) !== null) return false;

  storage.setItem(key, VIEW_VISITED);

  return storage.getItem(key) === VIEW_VISITED;
};
