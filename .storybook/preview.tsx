import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { Preview } from "@storybook/react-vite";
import type React from "react";

import "@gi/athena/athena.css";
import "../src/index.css";

import { messages as enMessages } from "../src/locales/en/messages";
import { messages as plMessages } from "../src/locales/pl/messages";

i18n.load({ en: enMessages, pl: plMessages });
i18n.activate("pl");

const withI18n = (Story: React.ComponentType): React.ReactElement => (
  <I18nProvider i18n={i18n}>
    <Story />
  </I18nProvider>
);

const preview: Preview = {
  decorators: [withI18n],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },
  },
};

export default preview;
