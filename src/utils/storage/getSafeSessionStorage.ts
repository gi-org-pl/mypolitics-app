import { safely } from "@/utils/function/safely";

// The storage of the tab, with calls that never throw - or nothing, when the
// browser refuses it or there is no browser. A read that fails finds nothing
// and a write that fails is dropped, so the caller goes on in memory.
export const getSafeSessionStorage = ():
  | Pick<Storage, "getItem" | "setItem" | "removeItem">
  | undefined => {
  const storage = safely<Storage | undefined>(
    () => globalThis.sessionStorage,
    undefined,
  );

  if (!storage) return undefined;

  return {
    getItem: (key) => safely(() => storage.getItem(key), null),
    setItem: (key, value) =>
      safely(() => storage.setItem(key, value), undefined),
    removeItem: (key) => safely(() => storage.removeItem(key), undefined),
  };
};
