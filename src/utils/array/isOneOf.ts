export const isOneOf = <Item>(
  items: readonly Item[],
  value: unknown,
): value is Item => items.some((item) => item === value);
