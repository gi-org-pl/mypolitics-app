import type { ReactElement } from "react";
import type { RenderOptions } from "@testing-library/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render } from "@testing-library/react";

export function renderWithI18n(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }) => <I18nProvider i18n={i18n}>{children}</I18nProvider>,
    ...options,
  });
}
