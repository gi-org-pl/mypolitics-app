import { describe, expect, it } from "vitest";

import type { PersonInput } from "@/types/orientation";

import { createPersonOrientation } from "./createPersonOrientation";

const friend: PersonInput = {
  resultId: "7c1f0c2e",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
  color: "#59B6A6",
};

describe("createPersonOrientation()", () => {
  it("uses the result identifier as the id and person as the type", () => {
    const orientation = createPersonOrientation(friend);

    expect(orientation.id).toBe("7c1f0c2e");
    expect(orientation.type).toBe("person");
  });

  it("carries the name, the image and the colour", () => {
    expect(createPersonOrientation(friend)).toEqual({
      id: "7c1f0c2e",
      type: "person",
      name: "Ania",
      imageUrl: "https://example.com/ania.png",
      color: "#59B6A6",
    });
  });

  it("cleans the name, the image and the colour by the same rules", () => {
    expect(
      createPersonOrientation({
        resultId: "7c1f0c2e",
        name: "  Ania\n",
        imageUrl: " https://example.com/ania.png\n",
        color: " #59B6A6 ",
      }),
    ).toEqual({
      id: "7c1f0c2e",
      type: "person",
      name: "Ania",
      imageUrl: "https://example.com/ania.png",
      color: "#59B6A6",
    });
    expect(
      createPersonOrientation({
        resultId: "7c1f0c2e",
        name: " \n ",
        imageUrl: "javascript:alert(1)",
        color: "#FFFFFF",
      }),
    ).toEqual({ id: "7c1f0c2e", type: "person" });
    expect(
      createPersonOrientation({
        resultId: "7c1f0c2e",
        name: "",
        imageUrl: "/avatars/ania.png",
        color: "red",
      }),
    ).toEqual({ id: "7c1f0c2e", type: "person" });
  });

  it("keeps a name that looks like packed text as written", () => {
    expect(
      createPersonOrientation({ resultId: "7c1f0c2e", name: '{"m":"Ania"}' })
        .name,
    ).toBe('{"m":"Ania"}');
  });

  it("leaves everything else absent", () => {
    expect(Object.keys(createPersonOrientation(friend)).sort()).toEqual([
      "color",
      "id",
      "imageUrl",
      "name",
      "type",
    ]);
    expect(createPersonOrientation({ resultId: "7c1f0c2e" })).toEqual({
      id: "7c1f0c2e",
      type: "person",
    });
  });
});
