// The part of a browser storage the app uses: text under a key.
export type TextStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

// A storage of values, kept as JSON in a storage of text.
export interface JsonStorage<Value> {
  getItem: (key: string) => Value | null;
  setItem: (key: string, value: Value) => void;
  removeItem: (key: string) => void;
}
