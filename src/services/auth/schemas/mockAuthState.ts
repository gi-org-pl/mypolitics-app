import { z } from "zod";

// What the stand-in for the accounts API keeps in the tab's storage: its
// accounts, the session, the pending sign-ups and links, and the sign-ups it
// has completed. It is read back with `safeParse`, so a value left by an
// older build, or not by the stand-in at all, starts it empty.

export const mockAuthProviderSchema = z.enum(["google", "facebook", "x"]);

export const mockAuthAccountSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().optional(),
  providers: z.array(mockAuthProviderSchema),
});

export const mockAuthStateSchema = z.object({
  accounts: z.array(mockAuthAccountSchema),
  session: z
    .object({ accountId: z.string(), provider: mockAuthProviderSchema })
    .optional(),
  pendingSignUps: z
    .record(
      z.string(),
      z.object({
        provider: mockAuthProviderSchema,
        suggestedName: z.string().optional(),
        email: z.string().optional(),
      }),
    )
    .default({}),
  pendingLinks: z
    .record(
      z.string(),
      z.object({
        provider: mockAuthProviderSchema,
        ownerProvider: mockAuthProviderSchema,
        accountId: z.string(),
      }),
    )
    .default({}),
  // Completed sign-ups, so a repeated completion answers with its account.
  completed: z
    .record(
      z.string(),
      z.object({ accountId: z.string(), provider: mockAuthProviderSchema }),
    )
    .default({}),
  nextId: z.number().default(1),
});

export type MockAuthState = z.infer<typeof mockAuthStateSchema>;
export type MockAuthAccount = z.infer<typeof mockAuthAccountSchema>;
