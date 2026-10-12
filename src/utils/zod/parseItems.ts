import type { z } from "zod";

export const parseItems = <Schema extends z.ZodType>(
  items: unknown,
  schema: Schema,
): z.output<Schema>[] =>
  Array.isArray(items)
    ? items.flatMap((item: unknown) => {
        const { success, data } = schema.safeParse(item);

        return success ? [data] : [];
      })
    : [];
