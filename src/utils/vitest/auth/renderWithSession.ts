import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import type { AuthSessionValue } from "@/types/auth";

import { createSessionValue } from "./createSessionValue";
import { SessionWrapper } from "./SessionWrapper";

// Renders what reads the session inside it, and gives the test the session
// value it was rendered with.
export const renderWithSession = (
  ui: ReactElement,
  value: AuthSessionValue = createSessionValue(),
) => ({
  ...render(ui, { wrapper: SessionWrapper(value) }),
  value,
});
