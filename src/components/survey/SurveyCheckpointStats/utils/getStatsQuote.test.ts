import { describe, expect, it } from "vitest";

import { getStatsQuote } from "./getStatsQuote";

const THESIS = "Podatki powinny być niższe";

describe("getStatsQuote()", () => {
  describe("given a statement that holds the thesis between quotation marks", () => {
    it("returns the thesis with its marks", () => {
      expect(
        getStatsQuote(
          `Należysz do 8% osób, które popierają tezę „${THESIS}”.`,
          THESIS,
        ),
      ).toBe(`„${THESIS}”`);
    });

    it("takes the marks of another language as they are", () => {
      expect(
        getStatsQuote(
          `Only 8% of people support the thesis “${THESIS}”. So do you.`,
          THESIS,
        ),
      ).toBe(`“${THESIS}”`);
    });

    it("keeps the marks the thesis has of its own", () => {
      const thesis = "Hasło „Polska dla Polaków” powinno być zakazane";

      expect(getStatsQuote(`Tezę „${thesis}” popiera 3% osób.`, thesis)).toBe(
        `„${thesis}”`,
      );
    });

    it("takes the place between marks when the words of the thesis stand earlier too", () => {
      expect(getStatsQuote("Tezę „Tezę” popiera tylko 3% osób.", "Tezę")).toBe(
        "„Tezę”",
      );
    });
  });

  describe("given a thesis with line breaks or doubled spaces", () => {
    it("returns it on one line, as the frame shows the statement", () => {
      expect(
        getStatsQuote(
          "Tylko 8% osób jest za tezą „Podatki  powinny\nbyć niższe”.",
          "Podatki  powinny\nbyć niższe",
        ),
      ).toBe(`„${THESIS}”`);
    });
  });

  describe("given a statement that holds the thesis without marks", () => {
    it("returns the thesis by itself", () => {
      expect(getStatsQuote(`Teza: ${THESIS}.`, THESIS)).toBe(THESIS);
      expect(getStatsQuote(`„${THESIS} - tak mówi teza.`, THESIS)).toBe(THESIS);
      expect(getStatsQuote(`${THESIS}” - tak mówi teza.`, THESIS)).toBe(THESIS);
    });
  });

  describe("given a statement that does not hold the thesis", () => {
    it("returns nothing", () => {
      expect(getStatsQuote("Tylko 8% osób jest za tą tezą.", THESIS)).toBe("");
    });
  });

  describe("given no thesis or no statement", () => {
    it.each([
      [undefined, THESIS],
      ["", THESIS],
      [`Teza „${THESIS}”.`, undefined],
      [`Teza „${THESIS}”.`, "  "],
    ])("returns nothing for %j and %j", (statement, thesis) => {
      expect(getStatsQuote(statement, thesis)).toBe("");
    });
  });
});
