import { DEFAULT_LANGUAGE } from "./src/constants/common";
import "@testing-library/jest-dom";
import { i18n } from "@lingui/core";
import { messages as enMessages } from "./src/locales/en/messages";
import { messages as plMessages } from "./src/locales/pl/messages";

i18n.load({ en: enMessages, pl: plMessages });
i18n.activate(DEFAULT_LANGUAGE);
