import { describe, expect, it } from "vitest";

import { QUIZ_PROJECT_IDS } from "@/constants/survey";

import { getProjectId } from "./getProjectId";

describe("getProjectId()", () => {
  describe("given a slug of the map", () => {
    it("returns the identifier of a known slug", () => {
      expect(getProjectId("mypolitics")).toBe(
        "5ab50822-e95e-4c7c-a1d6-14aceb68f108",
      );
      expect(getProjectId("prezydencki2025")).toBe(
        "69ef6c38-7292-4096-a9ef-a58e682dbfde",
      );
    });

    it("returns an identifier for every slug of the map", () => {
      for (const [slug, projectId] of Object.entries(QUIZ_PROJECT_IDS)) {
        expect(getProjectId(slug)).toBe(projectId);
      }
    });

    it("matches a slug whatever its letter case", () => {
      expect(getProjectId("MyPolitics")).toBe(QUIZ_PROJECT_IDS.mypolitics);
      expect(getProjectId("MYPOLITICS")).toBe(QUIZ_PROJECT_IDS.mypolitics);
      expect(getProjectId("Prezydencki2025")).toBe(
        QUIZ_PROJECT_IDS.prezydencki2025,
      );
    });
  });

  describe("given anything else", () => {
    it("returns undefined for an unknown, empty or missing slug", () => {
      expect(getProjectId("wyborczy2023")).toBeUndefined();
      expect(getProjectId("mypolitics ")).toBeUndefined();
      expect(getProjectId("mypolitics/")).toBeUndefined();
      expect(getProjectId("")).toBeUndefined();
      expect(getProjectId(undefined)).toBeUndefined();
      expect(getProjectId()).toBeUndefined();
    });

    it("returns undefined for a name every object has", () => {
      expect(getProjectId("constructor")).toBeUndefined();
      expect(getProjectId("toString")).toBeUndefined();
      expect(getProjectId("__proto__")).toBeUndefined();
    });
  });
});
