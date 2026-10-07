import { z } from "zod";

import { escapeLineBreaks } from "@/utils/json/escapeLineBreaks";
import { parseJsonObject } from "@/utils/json/parseJsonObject";

export const stringToJsonObjectSchema = z
  .string()
  .transform((text, context) => {
    const value =
      parseJsonObject(text) ?? parseJsonObject(escapeLineBreaks(text));

    if (!value) {
      context.addIssue({ code: "custom", message: "Invalid JSON object" });

      return z.NEVER;
    }

    return value;
  });
