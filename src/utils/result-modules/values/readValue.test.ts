import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  ResultModuleValue,
  ResultModuleValueDefinition,
  ResultModuleValueKind,
} from "@/types/results";

import { readBooleanValue } from "./readBooleanValue";
import { readChoiceValue } from "./readChoiceValue";
import { readColorValue } from "./readColorValue";
import { readNumberValue } from "./readNumberValue";
import { readTextValue } from "./readTextValue";
import { readValue } from "./readValue";

const text: ResultModuleValueDefinition<"text"> = { kind: "text" };

const localizedText: ResultModuleValueDefinition<"localizedText"> = {
  kind: "localizedText",
};

const number: ResultModuleValueDefinition<"number"> = {
  kind: "number",
  min: 0,
  max: 10,
  whole: true,
  nullable: true,
  fallback: 4,
};

const choice: ResultModuleValueDefinition<"choice"> = {
  kind: "choice",
  choices: ["name", "value"],
  fallback: "value",
};

const boolean: ResultModuleValueDefinition<"boolean"> = {
  kind: "boolean",
  fallback: true,
};

const color: ResultModuleValueDefinition<"color"> = { kind: "color" };

// One definition of every kind there is.
const DEFINITIONS: {
  [Kind in ResultModuleValueKind]: ResultModuleValueDefinition<Kind>;
} = { text, localizedText, number, choice, boolean, color };

// A value of every sort a record may hold, and none.
const VALUES: [ResultModuleValue | undefined][] = [
  ["name"],
  [" Nazwa\n"],
  ["#ef4444"],
  [""],
  [7],
  [7.5],
  [11],
  [true],
  [false],
  [null],
  [undefined],
];

describe("readValue()", () => {
  describe("given a definition of a text", () => {
    it.each(VALUES)("reads %j as a text", (value) => {
      expect(readValue(text, value)).toBe(readTextValue(text, value));
    });

    it("returns a text without the space around it, and nothing for any other", () => {
      expect(readValue(text, " Nazwa\n")).toBe("Nazwa");
      expect(readValue(text, 7)).toBeUndefined();
    });
  });

  describe("given a definition of a text per language", () => {
    it.each(VALUES)("reads %j as a text", (value) => {
      expect(readValue(localizedText, value)).toBe(
        readTextValue(localizedText, value),
      );
    });

    it("reads it as a definition of a text does", () => {
      for (const [value] of VALUES) {
        expect(readValue(localizedText, value)).toBe(readValue(text, value));
      }
    });
  });

  describe("given a definition of a number", () => {
    it.each(VALUES)("reads %j as a number", (value) => {
      expect(readValue(number, value)).toBe(readNumberValue(number, value));
    });

    it("returns a number within the bounds, false for nothing, and the fallback for any other", () => {
      expect(readValue(number, 7)).toBe(7);
      expect(readValue(number, null)).toBe(false);
      expect(readValue(number, "name")).toBe(4);
    });
  });

  describe("given a definition of a choice", () => {
    it.each(VALUES)("reads %j as a choice", (value) => {
      expect(readValue(choice, value)).toBe(readChoiceValue(choice, value));
    });

    it("returns a listed value, and the fallback for any other", () => {
      expect(readValue(choice, "name")).toBe("name");
      expect(readValue(choice, 7)).toBe("value");
    });
  });

  describe("given a definition of yes or no", () => {
    it.each(VALUES)("reads %j as yes or no", (value) => {
      expect(readValue(boolean, value)).toBe(readBooleanValue(boolean, value));
    });

    it("returns yes or no, and the fallback for any other", () => {
      expect(readValue(boolean, false)).toBe(false);
      expect(readValue(boolean, "false")).toBe(true);
    });
  });

  describe("given a definition of a colour", () => {
    it.each(VALUES)("reads %j as a colour", (value) => {
      expect(readValue(color, value)).toBe(readColorValue(color, value));
    });

    it("returns a colour that passes the colour check, and nothing for any other", () => {
      expect(readValue(color, "#ef4444")).toBe("#ef4444");
      expect(readValue(color, "red")).toBeUndefined();
    });
  });

  describe("given a definition of each kind and no value", () => {
    it("returns the fallback of a kind that has one, and nothing for a kind that has none", () => {
      expect(
        Object.fromEntries(
          Object.entries(DEFINITIONS).map(([kind, definition]) => [
            kind,
            readValue(definition),
          ]),
        ),
      ).toStrictEqual({
        text: undefined,
        localizedText: undefined,
        number: 4,
        choice: "value",
        boolean: true,
        color: undefined,
      });
    });
  });

  // Checked by the compiler, not at run time: `tsc` fails when one of these
  // stops holding.
  describe("the type of the result", () => {
    it("is what a definition of that kind is read as", () => {
      expectTypeOf(readValue(text)).toEqualTypeOf<string | undefined>();
      expectTypeOf(readValue(localizedText)).toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf(readValue(number)).toEqualTypeOf<number | false>();
      expectTypeOf(readValue(choice)).toEqualTypeOf<string>();
      expectTypeOf(readValue(boolean)).toEqualTypeOf<boolean>();
      expectTypeOf(readValue(color)).toEqualTypeOf<string | undefined>();
    });
  });
});
