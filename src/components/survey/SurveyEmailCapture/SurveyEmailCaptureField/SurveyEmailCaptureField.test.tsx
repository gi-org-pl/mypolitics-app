import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyEmailCaptureField } from "./SurveyEmailCaptureField";

const HINT = "Wpisz pełny adres e-mail, na przykład twoj@mail.com.";
const PROMISE = "Dbamy o Twoją prywatność.";

const onAddressChange = vi.fn();
const onSubmit = vi.fn();

// The field is controlled: the test keeps what is typed, like the card's
// parent does.
const Field = ({ address: firstAddress }: { address: string }) => {
  const [address, setAddress] = useState(firstAddress);

  return (
    <>
      <SurveyEmailCaptureField
        address={address}
        descriptionId="promise"
        onAddressChange={(typedAddress) => {
          onAddressChange(typedAddress);
          setAddress(typedAddress);
        }}
        onSubmit={onSubmit}
      />
      <p id="promise">{PROMISE}</p>
    </>
  );
};

const renderField = (address = "") => {
  onAddressChange.mockClear();
  onSubmit.mockClear();

  return renderWithI18n(<Field address={address} />);
};

const getField = () => screen.getByRole("textbox", { name: "Adres e-mail" });

const type = (text: string) =>
  fireEvent.change(getField(), { target: { value: text } });

const pressEnter = () => fireEvent.keyDown(getField(), { key: "Enter" });

describe("<SurveyEmailCaptureField />", () => {
  describe("given an empty field", () => {
    it("shows the placeholder and no hint, and is not focused", () => {
      renderField();

      expect(getField()).toHaveValue("");
      expect(getField()).toHaveAttribute("placeholder", "twoj@mail.com");
      expect(getField()).not.toHaveFocus();
      expect(document.body).toHaveFocus();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it('is named "Adres e-mail" and marked as an e-mail field the browser may fill in', () => {
      renderField();

      expect(getField()).toHaveAttribute("type", "email");
      expect(getField()).toHaveAttribute("autocomplete", "email");
      expect(getField()).not.toHaveAttribute("autofocus");
      expect(getField()).not.toBeRequired();
    });

    it("stands in no form, so the browser never shows a validation message of its own", () => {
      renderField("biuro@mypolitics");

      expect(getField().closest("form")).toBeNull();
    });

    it("is described from outside, by the element it is given", () => {
      renderField();

      const group = screen.getByRole("group");

      expect(group).toContainElement(getField());
      expect(group).toHaveAccessibleDescription(PROMISE);
    });
  });

  describe("given an address", () => {
    it("shows it in the field", () => {
      renderField("biuro@mypolitics.pl");

      expect(getField()).toHaveValue("biuro@mypolitics.pl");
    });
  });

  describe("when the taker types", () => {
    it("calls onAddressChange with the text as typed, after every change", () => {
      renderField();

      type("Jan K");
      type("Jan Kowalski <jan@poczta.pl>");

      expect(onAddressChange.mock.calls).toEqual([
        ["Jan K"],
        ["Jan Kowalski <jan@poczta.pl>"],
      ]);
      expect(getField()).toHaveValue("Jan Kowalski <jan@poczta.pl>");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows no hint while the text is not valid yet", () => {
      renderField();

      type("biuro@mypolitics");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("when the field loses focus", () => {
    it("shows the hint for text that is not a valid address", () => {
      renderField("biuro@mypolitics");

      fireEvent.blur(getField());

      expect(screen.getByRole("alert")).toHaveTextContent(HINT);
    });

    it.each([
      ["an empty field", ""],
      ["a valid address", "biuro@mypolitics.pl"],
    ])("shows no hint for %s", (_, address) => {
      renderField(address);

      fireEvent.blur(getField());

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("when the field loses focus to a press on another control", () => {
    it("shows the hint once the press is over, so the control does not move from under it", async () => {
      renderField("biuro@mypolitics");

      fireEvent.pointerDown(document.body);
      fireEvent.blur(getField());

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      fireEvent.pointerUp(document.body);

      expect(await screen.findByRole("alert")).toHaveTextContent(HINT);
    });
  });

  describe("when Enter is pressed", () => {
    it("submits a valid address", () => {
      renderField("biuro@mypolitics.pl");

      pressEnter();

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith("biuro@mypolitics.pl");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("submits the address trimmed", () => {
      renderField("  Biuro@myPolitics.pl ");

      pressEnter();

      expect(onSubmit).toHaveBeenCalledWith("Biuro@myPolitics.pl");
    });

    it("shows the hint and submits nothing for text that is not valid", () => {
      renderField("Jan Kowalski <jan@poczta.pl>");

      pressEnter();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent(HINT);
    });

    it("does nothing in an empty field", () => {
      renderField("   ");

      pressEnter();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onAddressChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does nothing while a letter is being composed", () => {
      renderField("biuro@mypolitics.pl");

      fireEvent.keyDown(getField(), { key: "Enter", isComposing: true });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("when another key is pressed", () => {
    it("submits nothing and shows no hint", () => {
      renderField("biuro@mypolitics");

      fireEvent.keyDown(getField(), { key: "a" });
      fireEvent.keyDown(getField(), { key: "Tab" });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("given a shown hint", () => {
    it("announces it", () => {
      renderField("biuro@mypolitics");

      fireEvent.blur(getField());

      expect(screen.getByRole("alert")).toHaveTextContent(HINT);
      expect(getField()).toHaveAccessibleDescription(HINT);
    });

    it("does not draw the field in the error state", () => {
      renderField("biuro@mypolitics");

      fireEvent.blur(getField());

      expect(getField()).not.toBeInvalid();
    });

    it("hides it when the text becomes valid", () => {
      renderField("biuro@mypolitics");

      fireEvent.blur(getField());
      type("biuro@mypolitics.pl");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(getField()).not.toHaveAccessibleDescription();
    });

    it("hides it when the field is emptied", () => {
      renderField("biuro@mypolitics");

      pressEnter();
      type("");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("given a hint that comes and goes", () => {
    it("keeps the field and the hint in one box that moves its height, so what is under it does not jump", () => {
      renderField("biuro@mypolitics");

      const group = screen.getByRole("group");
      const box = group.firstElementChild;

      expect(group.children).toHaveLength(1);
      expect(box).toHaveClass("data-[animating=true]:overflow-y-clip");
      expect(box).toContainElement(getField());

      pressEnter();

      expect(box).toContainElement(screen.getByRole("alert"));

      type("biuro@mypolitics.pl");

      expect(group.firstElementChild).toBe(box);
      expect(box).toContainElement(getField());
    });

    it("leaves room for the focus outline in that box, and takes no more room than the field alone", () => {
      renderField();

      const group = screen.getByRole("group");
      const room =
        group.firstElementChild?.firstElementChild?.firstElementChild;

      expect(room).toHaveClass("py-1");
      expect(group).toHaveClass("-my-1", "w-full");
    });

    it("lets the hint take its place in one step: only the colours of the field move by themselves", () => {
      renderField();

      const field = getField().closest(".rounded-2xl");

      expect(field).toHaveClass("transition-colors");
      expect(field).not.toHaveClass("transition-all");
    });
  });
});
