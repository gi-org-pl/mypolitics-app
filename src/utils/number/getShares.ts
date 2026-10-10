// Each value as its share of all of them together, from 0 to 1, in the order
// given. Nothing when a value is negative or not a finite number, or when
// they add up to nothing.
export const getShares = (values: readonly unknown[]): number[] | undefined => {
  const numbers = values.filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value) && value >= 0,
  );
  const sum = numbers.reduce((total, value) => total + value, 0);

  return numbers.length === values.length && sum > 0 && Number.isFinite(sum)
    ? numbers.map((value) => value / sum)
    : undefined;
};
