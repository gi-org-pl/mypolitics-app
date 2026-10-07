import { describe, expect, it } from "vitest";
import { readQuizOrientations } from "./readQuizOrientations";
import {
  identityQuizOrientations,
  lineBreakQuizOrientations,
  presidentialQuizOrientations,
} from "./readQuizOrientations.fixtures";

const official = { isOfficialQuiz: true };
const community = { isOfficialQuiz: false };

const getLinks = (response: unknown): (string[] | undefined)[] =>
  readQuizOrientations(response, official).map(
    ({ linkedOrientationIds }) => linkedOrientationIds,
  );

describe("readQuizOrientations()", () => {
  describe("given something that is not a list", () => {
    it.each([
      undefined,
      null,
      "",
      "orientations",
      7,
      true,
      {},
      { 0: { id: "a" }, length: 1 },
    ])("returns an empty list for %j", (response) => {
      expect(readQuizOrientations(response, official)).toEqual([]);
    });

    it("returns an empty list for an empty list", () => {
      expect(readQuizOrientations([], official)).toEqual([]);
    });
  });

  describe("given a list", () => {
    it("keeps the order it was sent in", () => {
      expect(
        readQuizOrientations(
          [{ id: "c" }, { id: "a" }, { id: "b" }],
          official,
        ).map(({ id }) => id),
      ).toEqual(["c", "a", "b"]);
    });

    it("drops an item without an id and keeps the others", () => {
      expect(
        readQuizOrientations(
          [
            { id: "a", generalName: "A" },
            { generalName: "B" },
            { id: "", generalName: "C" },
            { id: null, generalName: "D" },
            { id: 7, generalName: "E" },
            { id: "f", generalName: "F" },
          ],
          official,
        ).map(({ id, name }) => [id, name]),
      ).toEqual([
        ["a", "A"],
        ["f", "F"],
      ]);
    });

    it("keeps the first of two items with the same id", () => {
      expect(
        readQuizOrientations(
          [
            { id: "a", generalName: "First" },
            { id: "b", generalName: "Other" },
            { id: "a", generalName: "Second" },
          ],
          official,
        ).map(({ id, name }) => [id, name]),
      ).toEqual([
        ["a", "First"],
        ["b", "Other"],
      ]);
    });

    it("never throws on a malformed item", () => {
      const response = [
        undefined,
        null,
        "a",
        7,
        true,
        [],
        [{ id: "nested" }],
        {},
        { id: {} },
        { id: "a", generalName: "{", logoUrl: "{", description: "{" },
        { id: "b", generalName: 7, color: {}, linkedOrientations: "a" },
        { id: "c", type: 7, description: [], explanation: false },
      ];

      expect(() => readQuizOrientations(response, official)).not.toThrow();
      expect(readQuizOrientations(response, official)).toEqual([
        {
          id: "a",
          type: "other",
          isOfficial: false,
          isHidden: false,
          linkedOrientationIds: [],
        },
        {
          id: "b",
          type: "other",
          isOfficial: false,
          isHidden: false,
          linkedOrientationIds: [],
        },
        {
          id: "c",
          type: "other",
          isOfficial: false,
          isHidden: false,
          linkedOrientationIds: [],
        },
      ]);
    });

    it("reads every item with the same options", () => {
      const response = [
        { id: "a", generalName: '{"name":"A","isOfficial":true}' },
        { id: "b", generalName: '{"name":"B","isOfficial":true}' },
      ];

      expect(
        readQuizOrientations(response, official).map(
          ({ isOfficial }) => isOfficial,
        ),
      ).toEqual([true, true]);
      expect(
        readQuizOrientations(response, community).map(
          ({ isOfficial }) => isOfficial,
        ),
      ).toEqual([false, false]);
    });
  });

  describe("linked orientations", () => {
    it("keeps a link to an orientation of the same quiz", () => {
      expect(
        getLinks([
          { id: "a", linkedOrientations: ["c", "b"] },
          { id: "b", linkedOrientations: ["a"] },
          { id: "c" },
        ]),
      ).toEqual([["c", "b"], ["a"], []]);
    });

    it("drops a link to an unknown id and a link to itself", () => {
      expect(
        getLinks([
          { id: "a", linkedOrientations: ["x", "a", "b", ""] },
          { id: "b", linkedOrientations: ["b"] },
        ]),
      ).toEqual([["b"], []]);
    });

    it("drops a link to an item that was dropped", () => {
      expect(
        getLinks([
          { id: "a", linkedOrientations: ["b"] },
          { generalName: "b" },
        ]),
      ).toEqual([[]]);
    });

    it("keeps a repeated link once", () => {
      expect(
        getLinks([
          { id: "a", linkedOrientations: ["b", "c", "b", "b", "c"] },
          { id: "b" },
          { id: "c" },
        ])[0],
      ).toEqual(["b", "c"]);
    });

    it("returns an empty list when the field is missing or not a list", () => {
      expect(
        getLinks([
          { id: "a" },
          { id: "b", linkedOrientations: null },
          { id: "c", linkedOrientations: "a" },
          { id: "d", linkedOrientations: { 0: "a" } },
          { id: "e", linkedOrientations: [] },
        ]),
      ).toEqual([[], [], [], [], []]);
    });
  });

  describe("given the live shapes", () => {
    it("reads an identity of the identity quiz", () => {
      const [ideology, party, identity] = readQuizOrientations(
        identityQuizOrientations,
        official,
      );

      expect(identity).toEqual({
        id: "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
        type: "identity",
        nameForms: {
          masculine: "Międzynarodowy socjalista",
          feminine: "Międzynarodowa socjalistka",
        },
        imageUrlForms: {
          masculine:
            "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/miedzynarodowy-socjalista-m.png",
          feminine:
            "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/miedzynarodowy-socjalista-f.png",
        },
        description: expect.stringMatching(
          /^Twoje poglądy opierają się na .* współpracę międzynarodową\.$/,
        ),
        fullDescription: expect.stringMatching(
          /^Międzynarodowych Socjalistów wyróżniają .*\n\nWierzą, że .* współpracy międzynarodowej\.$/s,
        ),
        slogan: "Pracownicy wszystkich narodów łączcie się!",
        isOfficial: false,
        isHidden: false,
        linkedOrientationIds: [party.id],
      });
      expect(party).toEqual({
        id: "fa5274b9-3b9f-4d54-a07f-fe96bb65b2a9",
        type: "party",
        name: "Razem",
        imageUrl:
          "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/razem.png",
        color: "#870F57",
        description: expect.stringMatching(
          /^Partia Razem to .*\n\nWspółprzewodniczącymi .* Młodzi Razem\.$/s,
        ),
        isOfficial: false,
        isHidden: false,
        linkedOrientationIds: [],
      });
      expect(ideology).toEqual({
        id: "0654e995-7860-44b2-8476-430fdb7bec1a",
        type: "ideology",
        name: "Zielona Gospodarka",
        imageUrl:
          "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/zielona-gospodarka.svg",
        description: expect.stringMatching(/^Zielona gospodarka to podejście/),
        isOfficial: false,
        isHidden: false,
        linkedOrientationIds: [],
      });
    });

    it("reads a candidate of the presidential quiz", () => {
      const [candidate, hiddenCandidate] = readQuizOrientations(
        presidentialQuizOrientations,
        official,
      );

      expect(candidate).toEqual({
        id: "565946a2-6622-4fb6-8eee-196408544e9a",
        type: "party",
        name: "Artur Bartoszewicz",
        imageUrl:
          "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/prezydencki2025/2/bartoszewicz.png",
        color: "#FF0000",
        description:
          'Ekonomista, doktor nauk ekonomicznych, wykładowca akademicki, ekspert w zakresie polityki publicznej. Kandydat bezpartyjny, proponuje program oparty na tzw. "trzech siódemkach".',
        slogan: "Nowoczesna, silna i nowoczesna Polska!",
        websiteUrl: "https://777.org.pl/",
        isOfficial: true,
        isHidden: false,
        linkedOrientationIds: [],
      });
      expect(hiddenCandidate).toMatchObject({
        id: "538434a9-dfed-4680-be7d-01eadfcb27fe",
        type: "party",
        name: "Krzysztof Stanowski",
        slogan: "#Zerokonkretów",
        websiteUrl: "https://stanowski2025.de/",
        isOfficial: false,
        isHidden: true,
      });
    });

    it("reads an identity of the presidential quiz", () => {
      const identity = readQuizOrientations(
        presidentialQuizOrientations,
        official,
      )[2];

      expect(identity).toEqual({
        id: "c28e9896-ff92-4881-a650-0e7f828ec381",
        type: "identity",
        name: "Konserwatywny państwowiec",
        imageUrl:
          "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/konserwatywny-panstwowiec.png",
        description: expect.stringMatching(
          /^Twój wymarzony prezydent to lider, .*\. \n\nStawia na bliską .* narodowy interes\.$/s,
        ),
        fullDescription: expect.stringMatching(
          /^Konserwatywny Państwowiec to prezydent, .* kredytów hipotecznych\.$/,
        ),
        isOfficial: false,
        isHidden: false,
        linkedOrientationIds: [],
      });
    });

    it("reads an identity whose description holds raw line breaks", () => {
      const [identity] = readQuizOrientations(
        lineBreakQuizOrientations,
        official,
      );

      expect(identity).toMatchObject({
        id: "265d00ee-6004-4182-857f-bad9f97b3d9a",
        type: "identity",
        nameForms: {
          masculine: "Międzynarodowy socjalista",
          feminine: "Międzynarodowa socjalistka",
        },
        description: expect.stringMatching(
          /^Twoje poglądy opierają się na .* współpracę międzynarodową\.$/,
        ),
        fullDescription: expect.stringMatching(
          /^Międzynarodowych Socjalistów wyróżniają .* klas społecznych\.\n\nWierzą, że .*\n\nChcą nagłego .* współpracy międzynarodowej\.$/s,
        ),
        slogan: "Pracownicy wszystkich narodów łączcie się!",
        linkedOrientationIds: [],
      });
    });

    it("drops the official mark of a candidate in a community quiz", () => {
      expect(
        readQuizOrientations(presidentialQuizOrientations, community).map(
          ({ isOfficial }) => isOfficial,
        ),
      ).toEqual([false, false, false]);
    });
  });
});
