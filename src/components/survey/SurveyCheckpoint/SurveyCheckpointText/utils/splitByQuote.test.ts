import { describe, expect, it } from "vitest";

import { splitByQuote } from "./splitByQuote";

describe("splitByQuote()", () => {
  it("returns the parts before, inside and after the quotation", () => {
    expect(
      splitByQuote(
        "Tylko 4% osób jest za tezą „Podatki powinny być niższe”.",
        "Podatki powinny być niższe",
      ),
    ).toEqual({
      before: "Tylko 4% osób jest za tezą „",
      quoted: "Podatki powinny być niższe",
      after: "”.",
    });
  });

  it("returns empty parts around a quote at the start or at the end", () => {
    expect(splitByQuote("Teza na początku i reszta.", "Teza")).toEqual({
      before: "",
      quoted: "Teza",
      after: " na początku i reszta.",
    });
    expect(splitByQuote("Reszta i teza", "teza")).toEqual({
      before: "Reszta i ",
      quoted: "teza",
      after: "",
    });
  });

  it("takes the first occurrence when the quote is there twice", () => {
    expect(splitByQuote("Tak, tak i jeszcze raz tak.", "tak")).toEqual({
      before: "Tak, ",
      quoted: "tak",
      after: " i jeszcze raz tak.",
    });
  });

  it("returns the statement as one part when the quote is blank or missing", () => {
    const statement = "Jesteś na półmetku.";
    const whole = { before: statement, quoted: "", after: "" };

    expect(splitByQuote(statement, "")).toEqual(whole);
    expect(splitByQuote(statement, "Podatki")).toEqual(whole);
  });

  it("reads the quote as written, never as a pattern", () => {
    expect(splitByQuote("Czy a.b to a+b?", "a+b")).toEqual({
      before: "Czy a.b to ",
      quoted: "a+b",
      after: "?",
    });
  });
});
