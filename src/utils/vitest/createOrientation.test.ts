import { describe, expect, it } from "vitest";

import { createOrientation } from "./createOrientation";

describe("createOrientation()", () => {
  it("builds an ideology with the given id and name", () => {
    expect(createOrientation("liberalism", "Liberalizm")).toEqual({
      id: "liberalism",
      type: "ideology",
      name: "Liberalizm",
    });
  });

  it("leaves the name undefined when none is given", () => {
    const orientation = createOrientation("liberalism");

    expect(orientation.name).toBeUndefined();
    expect(orientation).toEqual({ id: "liberalism", type: "ideology" });
  });

  it("adds the fields of the overrides", () => {
    expect(
      createOrientation("liberalism", "Liberalizm", {
        color: "#9b59b6",
        isHidden: true,
      }),
    ).toEqual({
      id: "liberalism",
      type: "ideology",
      name: "Liberalizm",
      color: "#9b59b6",
      isHidden: true,
    });
  });

  it("lets the overrides replace the defaults and the arguments", () => {
    expect(
      createOrientation("liberalism", "Liberalizm", {
        id: "candidate",
        type: "person",
        name: "Jan Kowalski",
      }),
    ).toEqual({ id: "candidate", type: "person", name: "Jan Kowalski" });
  });
});
