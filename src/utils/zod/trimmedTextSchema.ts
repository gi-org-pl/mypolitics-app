import { z } from "zod";

export const trimmedTextSchema = z.string().trim().min(1);
