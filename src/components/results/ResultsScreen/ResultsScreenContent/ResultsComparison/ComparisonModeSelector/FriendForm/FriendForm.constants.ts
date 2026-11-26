import { FriendNotice } from "./FriendForm.types";

// Whether a notice says that the text of the field cannot be used. The field
// is marked as invalid then.
export const IS_NOTICE_ERROR: Record<FriendNotice, boolean> = {
  [FriendNotice.Hint]: false,
  [FriendNotice.Fetching]: false,
  [FriendNotice.Invalid]: true,
  [FriendNotice.Own]: true,
  [FriendNotice.OtherSurvey]: true,
  [FriendNotice.Unreadable]: true,
};

// What an empty field shows: the form of a result identifier, by an example
// that is no result. It is not a text of any language.
export const FRIEND_ID_PLACEHOLDER = "5218cde2-beac-4234-a0a7-c72f46e979a8";

// The name of each of the two parts of the form.
export const LABEL_CLASS_NAME =
  "text-base leading-4.75 font-bold wrap-break-word text-gi-light-primary";

// One part of the form: its name, and what it names under it.
export const PART_CLASS_NAME = "flex min-w-0 flex-col gap-2 p-3";

// The field of the frame over Athena's Input: a 32 px pill with a 12 px text
// 16 px from its edge - the border and the 4 px Athena keeps beside the text
// are part of that. A typed identifier is drawn in bold, as the identifier of
// the taker is; the placeholder is not.
//
// Athena draws the text twice: in the input, and in a copy over it while the
// field is not focused. Both get the same type. Keyboard focus is an outline
// around the pill, like every other control of the screen.
export const FIELD_CLASS_NAME =
  "min-h-8 rounded-full px-2.75 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-gi-primary [&_input]:py-1.75 [&_input]:text-xs [&_input]:leading-4 [&_input]:font-bold [&_input]:placeholder:font-normal [&_input]:placeholder:text-gi-primary/50 [&_span]:text-xs [&_span]:leading-4 [&_span]:font-bold";

// The outline of the field while its text can be used: the full primary
// colour of the frame, also while the pointer is over it. A field whose text
// cannot be used keeps Athena's red outline.
export const FIELD_BORDER_CLASS_NAME =
  "border-gi-primary hover:border-gi-primary focus-within:border-gi-primary";
