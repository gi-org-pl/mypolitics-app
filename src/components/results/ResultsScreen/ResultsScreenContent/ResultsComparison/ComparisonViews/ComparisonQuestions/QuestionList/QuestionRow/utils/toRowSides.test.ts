import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";

import {
  exampleFriendSide,
  exampleOrientationSide,
  findCompared,
  friendQuestions,
  orientationQuestions,
} from "../../../ComparisonQuestions.fixtures";
import { toRowSides } from "./toRowSides";

const progressivism = exampleOrientationSide.orientation;
const friend = exampleFriendSide.orientation;

const withOrientation = (questionId: string) =>
  toRowSides(
    findCompared(orientationQuestions, questionId),
    progressivism,
    "Ty",
  );

const withFriend = (questionId: string) =>
  toRowSides(findCompared(friendQuestions, questionId), friend, "Ty");

describe("toRowSides()", () => {
  describe("given any question", () => {
    it("gives two sides: the other one first, then the taker", () => {
      expect(withOrientation("housing").map(({ id }) => id)).toEqual([
        "other",
        "taker",
      ]);
    });

    it("names the other side by who it is, with its mark", () => {
      const [other] = withOrientation("housing");

      expect(other.who).toBe(progressivism);
      expect(other.isTaker).toBeUndefined();
    });

    it("names the taker by the word it is given, with the avatar of the taker", () => {
      const [, taker] = withOrientation("housing");

      expect(taker.who.name).toBe("Ty");
      expect(taker.who.imageUrl).toEqual(expect.any(String));
      expect(taker.isTaker).toBe(true);
    });

    it("gives the taker the answer they chose, held up against nothing", () => {
      const [, taker] = withOrientation("housing");

      expect(taker.answers).toEqual([
        {
          id: "housing-a2",
          text: "Rząd nie powinien interweniować na rynku mieszkaniowym",
        },
      ]);
    });
  });

  describe("given an orientation with one answer, which the taker did not choose", () => {
    it("gives that answer, as one the two disagree on", () => {
      const [other] = withOrientation("housing");

      expect(other.answers).toEqual([
        {
          id: "housing-a1",
          text: "Budowa tanich mieszkań na wynajem z publicznych pieniędzy",
          agreement: Agreement.Disagree,
        },
      ]);
    });
  });

  describe("given an orientation with several answers, one of them the taker's", () => {
    it("gives every one, in the order of the question: the taker's agrees, the rest disagree", () => {
      const [other] = withOrientation("prices");

      expect(other.answers).toEqual([
        {
          id: "prices-a1",
          text: "Rząd nie powinien interweniować na rynku mieszkaniowym",
          agreement: Agreement.Agree,
        },
        {
          id: "prices-a2",
          text: "Uproszczenie prawa budowlanego",
          agreement: Agreement.Disagree,
        },
      ]);
    });
  });

  describe("given an orientation no answer of the question lists", () => {
    it("gives the other side no answer, and the taker theirs", () => {
      const [other, taker] = withOrientation("rents");

      expect(other.answers).toEqual([]);
      expect(taker.answers).toHaveLength(1);
    });
  });

  describe("given a question the taker did not answer", () => {
    it("gives the taker no answer", () => {
      const [, taker] = withOrientation("army");

      expect(taker.answers).toEqual([]);
    });

    it("gives the answers of the other side with neither a tick nor a cross", () => {
      const [other] = withOrientation("army");

      expect(other.answers.map(({ id }) => id)).toEqual(["army-a3", "army-a4"]);
      expect(other.answers.map(({ agreement }) => agreement)).toEqual([
        Agreement.Neither,
        Agreement.Neither,
      ]);
    });
  });

  describe("given a friend", () => {
    it("gives the answer the friend chose, agreeing when it is the taker's", () => {
      const [other] = withFriend("democracy");

      expect(other.who).toBe(friend);
      expect(other.answers).toEqual([
        {
          id: "democracy-a1",
          text: "Zdecydowanie za",
          agreement: Agreement.Agree,
        },
      ]);
    });

    it("gives it as disagreeing when the taker chose another", () => {
      const [other, taker] = withFriend("future");

      expect(other.answers).toEqual([
        {
          id: "future-a3",
          text: "Wyjście z Unii Europejskiej",
          agreement: Agreement.Disagree,
        },
      ]);
      expect(taker.answers[0].id).toBe("future-a1");
    });

    it("gives the friend no answer to a question they did not answer", () => {
      const [other, taker] = withFriend("rents");

      expect(other.answers).toEqual([]);
      expect(taker.answers).toHaveLength(1);
    });

    it("gives the answer of the friend unmarked when the taker did not answer", () => {
      const [other, taker] = withFriend("army");

      expect(other.answers).toEqual([
        {
          id: "army-a4",
          text: "Zdecydowanie przeciw",
          agreement: Agreement.Neither,
        },
      ]);
      expect(taker.answers).toEqual([]);
    });
  });
});
