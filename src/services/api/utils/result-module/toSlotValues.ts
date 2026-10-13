// The values of the slots a module type has, each read with `read`. A slot
// whose value cannot be read is left out, and so is every slot not listed.
export const toSlotValues = (
  values: Record<string, string | undefined>,
  slots: readonly string[],
  read: (value?: string) => string | undefined,
): Record<string, string> =>
  Object.fromEntries(
    slots.flatMap((slot) => {
      const value = read(values[slot]);

      return value === undefined ? [] : [[slot, value]];
    }),
  );
