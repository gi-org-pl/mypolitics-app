// The field of the frame over Athena's Input: a 51 px white box with a 16 px
// corner and a hairline border, the text 16 px from its edge - the border and
// the 4 px Athena keeps beside the text are part of that. A typed address is
// drawn in bold, so a slip is easier to see; the placeholder is not.
//
// Athena draws the text twice: in the input, and in a copy over it while the
// field is not focused. Both get the same type. Keyboard focus is an outline
// around the box, like every other control of the questionnaire.
//
// Athena moves every property of the box in 300 ms, and gives the box a
// margin under it once the hint stands there: the margin would grow for
// 300 ms and the hint would creep down with it. Only the colours move here,
// so the hint takes its place in one step and the box around the field
// (below) moves the height.
export const FIELD_CLASS_NAME =
  "rounded-2xl border-gi-dark-ash px-2.75 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-gi-primary [&_input]:py-3.75 [&_input]:text-base [&_input]:leading-4.75 [&_input]:font-bold [&_input]:placeholder:font-normal [&_input]:placeholder:text-gi-primary/50 [&_span]:text-base [&_span]:leading-4.75 [&_span]:font-bold";

// The field and its hint stand in a box that moves its height when the hint
// comes or goes, so the consent and the button under it move instead of
// jumping. A box that moves cuts off what reaches over its top and bottom,
// and the focus outline of the field reaches 4 px over both: the content gets
// 4 px of room on each side and the group is pulled back by as much, so the
// outline is never cut and nothing stands elsewhere than without the box.
export const GROUP_CLASS_NAME = "-my-1 w-full";
export const ROOM_CLASS_NAME = "w-full py-1";
