// Form controls the e-mail card of the questionnaire and the step that
// completes a new account share, so the two read as one family.

// A text field over Athena's Input: a 51 px white box with a 16 px corner and
// a hairline border, the text 16 px from its edge - the border and the 4 px
// Athena keeps beside the text are part of that. Typed text is drawn in bold,
// so a slip is easier to see; the placeholder is not.
//
// Athena draws the text twice: in the input, and in a copy over it while the
// field is not focused. Both get the same type. Keyboard focus is an outline
// around the box, like every other control of the app.
//
// Athena moves every property of the box in 300 ms, and gives the box a
// margin under it once a hint stands there: the margin would grow for 300 ms
// and the hint would creep down with it. Only the colours move here, so a
// hint takes its place in one step.
export const TEXT_FIELD_CLASS_NAME =
  "rounded-2xl border-gi-dark-ash px-2.75 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-gi-primary [&_input]:py-3.75 [&_input]:text-base [&_input]:leading-4.75 [&_input]:font-bold [&_input]:placeholder:font-normal [&_input]:placeholder:text-gi-primary/50 [&_span]:text-base [&_span]:leading-4.75 [&_span]:font-bold";

// A consent over Athena's Checkbox: 14 px text on 120% lines, regular, with
// the box at the start of the first line and the text in a column beside it.
//
// Athena takes the label as plain text and lays the box and the label out in
// two wrappers of its own. The wrappers are taken out of the layout, so the
// label is a run of text and a link that stands after the label, outside it,
// continues its last line, as the frames draw the sentences.
export const CONSENT_CLASS_NAME =
  "relative pl-5.5 text-sm leading-[1.2] wrap-break-word text-gi-primary [&_label]:leading-[1.2] [&_label]:font-normal [&>div]:contents [&>div>div]:contents";

// The box of the frames: white with a hairline border while unticked.
export const CONSENT_CHECKBOX_CLASS_NAME =
  "absolute top-0 left-0 border-gi-dark-ash bg-white shadow-none";
