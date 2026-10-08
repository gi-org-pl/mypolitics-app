export const uniqueBy = <Item>(
  items: Item[],
  getKey: (item: Item) => string,
): Item[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
};
