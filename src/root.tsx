import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Links, Outlet, Scripts } from "react-router";

import { messages as enMessages } from "../src/locales/en/messages";
import { messages as plMessages } from "../src/locales/pl/messages";
import { Footer } from "./components/shared/Footer/Footer";
import { Header } from "./components/shared/Header/Header";
import { DEFAULT_LANGUAGE } from "./constants/common";

import "./index.css";

i18n.load({ en: enMessages, pl: plMessages });
i18n.activate(DEFAULT_LANGUAGE);

export default function App() {
  return (
    <html lang={DEFAULT_LANGUAGE}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>mypolitics</title>
        <Links />
      </head>
      <body>
        <I18nProvider i18n={i18n}>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}
