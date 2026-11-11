import type { AuthClient } from "@/types/auth";

import { createMockAuthClient } from "./createMockAuthClient";

// The client the app signs in with. Today it is the stand-in, because the
// API has no accounts yet; the task that connects the API (issue #207)
// changes this line and nothing else.
export const authClient: AuthClient = createMockAuthClient();
