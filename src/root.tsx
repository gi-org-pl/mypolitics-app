import { i18n } from "@lingui/core";
import { Outlet, Scripts } from "react-router";
import { I18nProvider } from "@lingui/react";
import "@gi/athena/athena.css";

import { messages as enMessages } from "../src/locales/en/messages";
import { messages as plMessages } from "../src/locales/pl/messages";
import { DEFAULT_LANGUAGE } from "./constants/common";

import "./index.css";

i18n.load({ en: enMessages, pl: plMessages });
i18n.activate(DEFAULT_LANGUAGE);

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>mypolitics</title>
      </head>
      <body>
        <I18nProvider i18n={i18n}>
          <Outlet />
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}
