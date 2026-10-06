export interface KeyedItem<Item> {
  item: Item;
  key: string;
}

export const withKeys = <Item>(
  items: Item[],
  getId: (item: Item) => string,
): KeyedItem<Item>[] => {
  const seen = new Map<string, number>();

  return items.map((item) => {
    const id = getId(item);
    const occurrence = seen.get(id) ?? 0;

    seen.set(id, occurrence + 1);

    return { item, key: `${id}-${occurrence}` };
  });
};
