import { describe, expect, it } from "vitest";

import { toCssUrl } from "./toCssUrl";

describe("toCssUrl()", () => {
  it("writes an address as a quoted url value", () => {
    expect(toCssUrl("https://example.com/a.svg")).toBe(
      'url("https://example.com/a.svg")',
    );
  });

  it("leaves the characters of a data address as they are", () => {
    const address = "data:image/svg+xml,%3Csvg viewBox='0 0 32 32'/%3E";

    expect(toCssUrl(address)).toBe(`url("${address}")`);
  });

  it("escapes a quotation mark and a backslash, so the address cannot end its string", () => {
    expect(toCssUrl('a"); color: red; ("b')).toBe(
      'url("a\\22 ); color: red; (\\22 b")',
    );
    expect(toCssUrl("a\\b")).toBe('url("a\\5c b")');
  });

  it("escapes line breaks", () => {
    expect(toCssUrl("a\nb\rc\fd")).toBe('url("a\\a b\\d c\\c d")');
  });
});
