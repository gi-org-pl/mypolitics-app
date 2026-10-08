import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import {
  DEMOGRAPHICS_FIELD_IDS,
  DEMOGRAPHICS_VALUES,
} from "@/constants/survey";

import { GENDER_LABELS } from "../SurveyQuestionnaireDemographics.constants";
import { useDemographicsOptions } from "./useDemographicsOptions";

const TEST_LOCALE = "test";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderOptions = () =>
  renderHook(() => useDemographicsOptions(), { wrapper });

describe("useDemographicsOptions()", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  describe("given the language of the app", () => {
    it("lists 87 ages from 13 to 99, youngest first, labelled with their number", () => {
      const { age } = renderOptions().result.current;

      expect(age).toHaveLength(87);
      expect(age[0]).toEqual({ value: "13", label: "13" });
      expect(age[86]).toEqual({ value: "99", label: "99" });
      expect(age.map(({ value }) => Number(value))).toEqual(
        Array.from({ length: 87 }, (_, index) => 13 + index),
      );
      expect(age.every(({ value, label }) => value === label)).toBe(true);
    });

    it("lists the gender, residence and education options in the order of the table, with their values", () => {
      const { gender, residenceAreaSize, education } =
        renderOptions().result.current;

      expect(gender).toEqual([
        { value: "female", label: "Kobieta" },
        { value: "male", label: "Mężczyzna" },
        { value: "other", label: "Inna" },
        { value: "prefer_not_to_share", label: "Wolę nie podawać" },
      ]);
      expect(residenceAreaSize).toEqual([
        { value: "village", label: "Wieś" },
        { value: "city_below_50k", label: "Miasto do 50 tys. mieszkańców" },
        {
          value: "city_below_200k",
          label: "Miasto od 50 do 200 tys. mieszkańców",
        },
        {
          value: "city_below_500k",
          label: "Miasto od 200 do 500 tys. mieszkańców",
        },
        {
          value: "city_over_500k",
          label: "Miasto powyżej 500 tys. mieszkańców",
        },
      ]);
      expect(education).toEqual([
        { value: "primary", label: "Podstawowe" },
        { value: "basic_vocational", label: "Zasadnicze zawodowe" },
        { value: "secondary", label: "Średnie" },
        { value: "higher", label: "Wyższe" },
      ]);
    });

    it("has a label for every value of DEMOGRAPHICS_VALUES", () => {
      const options = renderOptions().result.current;

      for (const fieldId of DEMOGRAPHICS_FIELD_IDS) {
        expect(options[fieldId].map(({ value }) => value)).toEqual(
          DEMOGRAPHICS_VALUES[fieldId],
        );
        expect(options[fieldId].every(({ label }) => label.trim() !== "")).toBe(
          true,
        );
      }
    });
  });

  describe("when rendered again in the same language", () => {
    it("keeps the same lists", () => {
      const { result, rerender } = renderOptions();
      const options = result.current;

      rerender();

      expect(result.current).toBe(options);
    });
  });

  describe("when the language of the app changes", () => {
    it("labels the options in the new language", () => {
      const { result } = renderOptions();

      act(() => {
        i18n.load(TEST_LOCALE, { [GENDER_LABELS.female.id]: "Woman" });
        i18n.activate(TEST_LOCALE);
      });

      expect(result.current.gender[0]).toEqual({
        value: "female",
        label: "Woman",
      });
    });
  });
});
