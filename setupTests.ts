import { DEFAULT_LANGUAGE } from './src/constants/common';
import "@testing-library/jest-dom";
import { i18n } from "@lingui/core";

i18n.load(DEFAULT_LANGUAGE, {});
i18n.activate(DEFAULT_LANGUAGE);