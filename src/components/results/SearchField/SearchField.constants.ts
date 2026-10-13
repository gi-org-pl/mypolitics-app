// The search field of the frame over Athena's Input: a 40 px pill with the
// icon 16 px from its edge, 12 px before a 16 px text, and a placeholder at
// half the colour. Athena draws the text twice - in the input, and in a copy
// over it while the field is not focused - so both get the same type.
// Keyboard focus is an outline around the pill, like every other control of
// the screen.
export const SEARCH_FIELD_CLASS_NAME =
  "px-3.75 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-gi-primary [&>div:first-child]:mr-3 [&_input]:py-2 [&_input]:text-base [&_input]:leading-5.5 [&_input]:placeholder:text-gi-primary/50 [&_span]:text-base [&_span]:leading-5.5";
