import { describe, expect, it } from "vitest";

import { EMAIL_MAX_LENGTH } from "@/constants/survey";

import { isEmailAddress } from "./isEmailAddress";

const DOMAIN = "@mypolitics.pl";

// An address of exactly this many characters.
const createAddress = (length: number): string =>
  `${"a".repeat(length - DOMAIN.length)}${DOMAIN}`;

describe("isEmailAddress()", () => {
  describe("given an address", () => {
    it.each([
      ["biuro@mypolitics.pl"],
      ["a@b.c"],
      ["jan.kowalski+quiz@poczta.onet.pl"],
      ["jan@sub.domena.example.com"],
      ["_@1.2"],
    ])("accepts an address with one @, a local part and a domain with a dot: %s", (text) => {
      expect(isEmailAddress(text)).toBe(true);
    });

    it.each([
      ["  biuro@mypolitics.pl"],
      ["biuro@mypolitics.pl  "],
      ["\tbiuro@mypolitics.pl\n"],
    ])("ignores space around the address: %j", (text) => {
      expect(isEmailAddress(text)).toBe(true);
    });

    it.each([
      ["Biuro@MyPolitics.PL"],
      ["BIURO@MYPOLITICS.PL"],
      ["żółć@mypolitics.pl"],
      ["jan@żółć.pl"],
      ["用户@例子.广告"],
    ])("accepts capital letters and letters outside ASCII: %s", (text) => {
      expect(isEmailAddress(text)).toBe(true);
    });

    it("accepts a well-formed address with a typo in the domain", () => {
      expect(isEmailAddress("jan@gmial.com")).toBe(true);
    });
  });

  describe("given no address", () => {
    it.each([
      [""],
      [" "],
      ["\n\t  "],
    ])("rejects an empty text and a text of only space: %j", (text) => {
      expect(isEmailAddress(text)).toBe(false);
    });

    it.each([
      ["biuro"],
      ["mypolitics.pl"],
      ["@mypolitics.pl"],
      ["biuro@"],
      ["@"],
    ])("rejects a text with no @, nothing before it or nothing after it: %s", (text) => {
      expect(isEmailAddress(text)).toBe(false);
    });
  });

  describe("given whitespace inside", () => {
    it.each([
      ["Jan Kowalski <jan@poczta.pl>"],
      ["jan kowalski@poczta.pl"],
      ["jan@poczta .pl"],
      ["jan@poczta.pl\njan@poczta.pl"],
      ["jan@\tpoczta.pl"],
    ])("rejects a space inside, as in a pasted name with an address: %j", (text) => {
      expect(isEmailAddress(text)).toBe(false);
    });
  });

  describe("given more than one address", () => {
    it.each([
      ["jan@@poczta.pl"],
      ["jan@poczta@onet.pl"],
      ["jan@poczta.pl,anna@poczta.pl"],
      ["jan@poczta.pl;anna@poczta.pl"],
    ])("rejects two @ and two addresses: %s", (text) => {
      expect(isEmailAddress(text)).toBe(false);
    });
  });

  describe("given a domain that is not one", () => {
    it.each([
      ["biuro@mypolitics"],
      ["biuro@.mypolitics.pl"],
      ["biuro@mypolitics.pl."],
      ["biuro@mypolitics..pl"],
      ["biuro@."],
    ])("rejects a domain with no dot, a dot at its start or end, and two dots in a row: %s", (text) => {
      expect(isEmailAddress(text)).toBe(false);
    });
  });

  describe("given a long text", () => {
    it("rejects more than 254 characters and accepts exactly 254", () => {
      expect(EMAIL_MAX_LENGTH).toBe(254);
      expect(createAddress(254)).toHaveLength(254);
      expect(isEmailAddress(createAddress(254))).toBe(true);
      expect(isEmailAddress(createAddress(255))).toBe(false);
      expect(isEmailAddress(createAddress(2000))).toBe(false);
    });

    it("measures the address without the space around it", () => {
      expect(isEmailAddress(`   ${createAddress(254)}   `)).toBe(true);
    });
  });
});
