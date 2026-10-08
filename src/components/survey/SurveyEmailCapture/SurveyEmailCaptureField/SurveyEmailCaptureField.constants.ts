// The field of the frame over Athena's Input: a 51 px white box with a 16 px
// corner and a hairline border, the text 16 px from its edge - the border and
// the 4 px Athena keeps beside the text are part of that. A typed address is
// drawn in bold, so a slip is easier to see; the placeholder is not.
//
// Athena draws the text twice: in the input, and in a copy over it while the
// field is not focused. Both get the same type. Keyboard focus is an outline
// around the box, like every other control of the questionnaire.
export const FIELD_CLASS_NAME =
  "rounded-2xl border-gi-dark-ash px-2.75 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-gi-primary [&_input]:py-3.75 [&_input]:text-base [&_input]:leading-4.75 [&_input]:font-bold [&_input]:placeholder:font-normal [&_input]:placeholder:text-gi-primary/50 [&_span]:text-base [&_span]:leading-4.75 [&_span]:font-bold";
