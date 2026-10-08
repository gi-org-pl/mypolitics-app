import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";
import { getNewTraitCandidate } from "./getNewTraitCandidate";
import {
  createRecord,
  createState,
  createTriggerInput,
  halfwayCard,
  newTraitCard,
} from "./getNextCheckpoint.fixtures";

// The unlocked traits of a state, in the quiz's order.
const monarchism = createOrientation("monarchism", "Monarchizm");
const pacifism = createOrientation("pacifism", "Pacyfizm");
const state = createState(30, 60, { unlockedTraits: [monarchism, pacifism] });

describe("getNewTraitCandidate()", () => {
  it("returns nothing when no trait is unlocked", () => {
    expect(getNewTraitCandidate(createTriggerInput())).toBeUndefined();
  });

  it("returns the first unlocked trait that was not announced, in the quiz's order", () => {
    expect(getNewTraitCandidate(createTriggerInput({ state }))).toEqual({
      type: "new-trait",
      boundary: 30,
      trait: monarchism,
    });
  });

  it("returns the next one once the first was announced", () => {
    expect(
      getNewTraitCandidate(
        createTriggerInput({
          state,
          record: createRecord([halfwayCard, newTraitCard]),
        }),
      ),
    ).toEqual({ type: "new-trait", boundary: 30, trait: pacifism });
  });

  it("returns nothing when every unlocked trait was announced", () => {
    expect(
      getNewTraitCandidate(
        createTriggerInput({
          state,
          record: createRecord([
            newTraitCard,
            halfwayCard,
            { ...newTraitCard, trait: pacifism },
          ]),
        }),
      ),
    ).toBeUndefined();
  });

  it("does not bring back a trait that was announced and is no longer unlocked", () => {
    expect(
      getNewTraitCandidate(
        createTriggerInput({
          state: createState(30, 60, { unlockedTraits: [pacifism] }),
          record: createRecord([{ ...newTraitCard, trait: pacifism }]),
        }),
      ),
    ).toBeUndefined();
  });
});
