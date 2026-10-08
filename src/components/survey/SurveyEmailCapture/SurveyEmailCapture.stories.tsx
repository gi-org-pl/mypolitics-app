import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SurveyEmailCapture } from "./SurveyEmailCapture";

// The card is controlled: a story keeps what is typed and ticked, starting
// from its arguments. It keeps them in the state of the story and not in the
// arguments, which change a moment after the key - too late for a field that
// is typed in. No story makes a request.
const meta = {
  title: "Survey/SurveyEmailCapture",
  component: SurveyEmailCapture,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    address: "",
    hasConsent: false,
    privacyPolicyHref: "/privacy",
    onAddressChange: fn(),
    onConsentChange: fn(),
    onSubmit: fn(),
    onSkip: fn(),
  },
  render: function Render(args) {
    const [address, setAddress] = useState(args.address);
    const [hasConsent, setHasConsent] = useState(args.hasConsent);

    return (
      <SurveyEmailCapture
        {...args}
        address={address}
        hasConsent={hasConsent}
        onAddressChange={(typedAddress) => {
          args.onAddressChange(typedAddress);
          setAddress(typedAddress);
        }}
        onConsentChange={(isTicked) => {
          args.onConsentChange(isTicked);
          setHasConsent(isTicked);
        }}
      />
    );
  },
} satisfies Meta<typeof SurveyEmailCapture>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const AddressEntered: Story = {
  args: { address: "biuro@mypolitics.pl" },
};

export const NotValidYet: Story = {
  args: { address: "biuro@mypolitics" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("textbox", { name: "Adres e-mail" }),
    );
    await userEvent.tab();

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Wpisz pełny adres e-mail, na przykład twoj@mail.com.",
    );
    await expect(canvas.getByRole("button", { name: "Pomiń" })).toBeVisible();
  },
};

export const ConsentTicked: Story = {
  args: { address: "biuro@mypolitics.pl", hasConsent: true },
};

export const LongAddress: Story = {
  args: {
    address:
      "bardzo.dlugi.adres.ktory.nie.miesci.sie.w.polu@poczta.fundacja-generacja-innowacja.example.org",
  },
};
