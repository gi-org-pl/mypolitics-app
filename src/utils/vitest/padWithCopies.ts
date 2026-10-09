// Fills a list up to `length` with copies of its own items, each copy under an
// identifier of its own. For fixtures that keep a few items of a long list.
export const padWithCopies = <Item extends { id: string }>(
  items: Item[],
  length: number,
): Item[] =>
  Array.from({ length }, (_, index) => {
    const item = items[index % items.length];

    return index < items.length ? item : { ...item, id: `${item.id}-${index}` };
  });
