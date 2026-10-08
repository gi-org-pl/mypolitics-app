// The consent of the frame over Athena's Checkbox: 14 px text on 120% lines,
// regular, with the box at the start of the first line and the text in a
// column beside it.
//
// Athena takes the label as plain text and lays the box and the label out in
// two wrappers of its own. The wrappers are taken out of the layout, so the
// label is a run of text and the privacy link - which stands after the label,
// outside it - continues its last line, as the frame draws the sentence.
export const CONSENT_CLASS_NAME =
  "relative pl-5.5 text-sm leading-[1.2] wrap-break-word text-gi-primary [&_label]:leading-[1.2] [&_label]:font-normal [&>div]:contents [&>div>div]:contents";

// The box of the frame: white with a hairline border while unticked.
export const CHECKBOX_CLASS_NAME =
  "absolute top-0 left-0 border-gi-dark-ash bg-white shadow-none";
