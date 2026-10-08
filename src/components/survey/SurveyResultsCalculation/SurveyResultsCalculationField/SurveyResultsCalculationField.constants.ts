// The field: a dark surface with a 16 px corner and 16 px around its content,
// which is stacked from the top and centred. It is as tall as a full stack of
// eight one-row lines, so the card keeps its height while the lines arrive;
// lines that wrap make it taller.
export const FIELD_CLASS_NAME =
  "relative isolate flex min-h-106.25 w-full flex-col items-center overflow-hidden rounded-2xl bg-gi-dark-primary p-4";

// The drift of the rings: the length they have moved outwards grows by one
// step between two rings, which gives the starting picture again. The length
// is the custom property `--survey-rings-shift`, which the stylesheet of the
// app makes known to the browser as a length. Where it is not known as one,
// it jumps by the whole step half way through - the same picture - so the
// rings simply stand still.
export const RINGS_KEYFRAMES = `
  @keyframes survey-rings-drift {
    to {
      --survey-rings-shift: 45px;
    }
  }
`;

// The ring artwork of the frame, drawn in CSS: bands 22.5 px wide, 45 px from
// one to the next, around a centre near the top left corner, fading with the
// distance from it. The bands are a repeating gradient in the colour of the
// element - a neutral grey, which over the dark surface gives the grey of the
// artwork - that starts one step before the drift, so that a drift of a whole
// step gives the starting picture again. The fade is a mask, which stays
// where it is.
export const RINGS_CLASS_NAME =
  "pointer-events-none absolute inset-0 -z-10 text-neutral-500 bg-[repeating-radial-gradient(circle_at_38px_49px,currentColor_calc(var(--survey-rings-shift,0px)-45px),currentColor_calc(var(--survey-rings-shift,0px)-23px),transparent_calc(var(--survey-rings-shift,0px)-22px),transparent_calc(var(--survey-rings-shift,0px)-1px),currentColor_var(--survey-rings-shift,0px))] mask-[radial-gradient(circle_at_38px_49px,rgb(0_0_0/0.55),rgb(0_0_0/0.4)_150px,rgb(0_0_0/0.24)_420px)]";

// While a run is under way the rings drift outwards without end, one step in
// 3 seconds. Under reduced motion they stand still.
export const RINGS_DRIFT_CLASS_NAME =
  "animate-[survey-rings-drift_3s_linear_infinite] motion-reduce:animate-none";
