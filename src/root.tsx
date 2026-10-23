import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { I18nProvider } from "@lingui/react";
import type { ReactNode } from "react";
import {
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";

import { messages as enMessages } from "../src/locales/en/messages";
import { messages as plMessages } from "../src/locales/pl/messages";
import { AuthDialogProvider } from "./components/shared/AuthDialogProvider/AuthDialogProvider";
import { AuthSessionProvider } from "./components/shared/AuthSessionProvider/AuthSessionProvider";
import { Footer } from "./components/shared/Footer/Footer";
import { Header } from "./components/shared/Header/Header";
import { DEFAULT_LANGUAGE } from "./constants/common";
import { SHARE_IMAGE, SITE_NAME } from "./constants/document";

import "./index.css";

i18n.load({ en: enMessages, pl: plMessages });
i18n.activate(DEFAULT_LANGUAGE);

/**
 * The HTML document. React Router renders this export around the app and
 * around its loading fallback, so the built `index.html` already links the
 * stylesheet and sets the viewport before any script runs. The icons, the
 * manifest and the tags of link previews are there for the same reason: the
 * browser and the crawlers read them from that file. The icon files live in
 * `public/`; the SVG favicon is the myPolitics logomark as the brand book
 * ships it, and the raster files are rendered from it.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANGUAGE}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{SITE_NAME}</title>
        <link
          rel="icon"
          href="/favicon.ico"
          sizes="16x16 32x32 48x48"
          type="image/x-icon"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:image" content={SHARE_IMAGE.url} />
        <meta property="og:image:type" content={SHARE_IMAGE.type} />
        <meta property="og:image:width" content={String(SHARE_IMAGE.width)} />
        <meta property="og:image:height" content={String(SHARE_IMAGE.height)} />
        <meta property="og:image:alt" content={t`Logo myPolitics`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={SHARE_IMAGE.url} />
        <meta name="twitter:image:alt" content={t`Logo myPolitics`} />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * What the built `index.html` shows until the scripts have loaded: nothing,
 * instead of React Router's default developer message.
 */
export function HydrateFallback() {
  return null;
}

export default function App() {
  // The deepest route that matches is the view on screen.
  const routeId = useMatches().at(-1)?.id;

  return (
    <I18nProvider i18n={i18n}>
      <AuthSessionProvider>
        <AuthDialogProvider>
          <div className="flex min-h-dvh flex-col">
            <Header routeId={routeId} />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </AuthDialogProvider>
      </AuthSessionProvider>
    </I18nProvider>
  );
}
