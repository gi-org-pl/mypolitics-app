// A list with an item taken out when it is in it, and put at its end when it
// is not. The list given is left as it is.
export const toggleItem = <Item>(items: readonly Item[], item: Item): Item[] =>
  items.includes(item)
    ? items.filter((listed) => listed !== item)
    : [...items, item];
