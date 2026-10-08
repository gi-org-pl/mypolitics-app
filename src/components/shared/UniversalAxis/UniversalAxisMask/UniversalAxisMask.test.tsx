import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HATCH_CLASS_NAME } from "@/constants/hatch";

import { UniversalAxisMask } from "./UniversalAxisMask";

describe("<UniversalAxisMask />", () => {
  it("covers the whole track with the hatch", () => {
    render(<UniversalAxisMask />);

    const mask = screen.getByTestId("universal-axis-mask");

    expect(mask).toHaveClass("absolute", "inset-0", HATCH_CLASS_NAME);
    expect(mask).not.toHaveAttribute("style");
  });

  it("holds nothing a value could be read from", () => {
    const { container } = render(<UniversalAxisMask />);

    expect(screen.getByTestId("universal-axis-mask")).toBeEmptyDOMElement();
    expect(container.children).toHaveLength(1);
    expect(container.querySelector("[style]")).toBeNull();
  });
});
