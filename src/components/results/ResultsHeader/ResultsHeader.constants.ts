import type { ResultsHeaderBand } from "./ResultsHeader.types";

export const MIN_CONFIDENCE = 0;
export const MAX_CONFIDENCE = 100;

export const BAND_CLASS_NAME: Record<ResultsHeaderBand, string> = {
  partial: "text-gi-orange",
  match: "text-gi-green",
};

export const IMAGE_CLASS_NAME = "absolute inset-[5px] size-[55px] rounded-full";

// What lies inside the ring: one pixel larger than the 55 px that show, on
// every side, so that its edge is covered by the ring drawn over it. The
// padding keeps the image itself at 55 px.
export const RING_IMAGE_CLASS_NAME =
  "absolute inset-[4px] size-[57px] rounded-full p-px";

// The track of the ring - the part the arc leaves: the band colour at 10% on
// the header's own background, as an opaque colour, so that it covers the
// edge under it.
export const RING_TRACK_CLASS_NAME =
  "fill-none stroke-[color-mix(in_srgb,currentColor_10%,var(--color-gi-ash))]";

// How far the track runs on under each end of the arc, in hundredths of the
// circle, so that nothing shows through where the two meet.
export const RING_OVERLAP = 1;

// The name is drawn at 24 px as long as its longest word fits in one line,
// and smaller - down to 16 px - when it does not, so that a word is not cut
// in the middle. The room for a line is the header's width less the two
// paddings, the ring and the gap (113 px); a letter of the bold face is
// counted as 0.6 em, which keeps words of up to 12 letters at 24 px in a
// header of 288 px.
export const NAME_SIZE_CLASS_NAME =
  "text-[length:clamp(1rem,calc((100cqw_-_113px)_/_(var(--name-letters)_*_0.6)),1.5rem)]";

// In the wide layout the extras take up to half of the row: the room for a
// line is half of the header's width less 115 px.
export const NAME_SIZE_BESIDE_EXTRAS_CLASS_NAME =
  "@xl:text-[length:clamp(1rem,calc((50cqw_-_115px)_/_(var(--name-letters)_*_0.6)),1.5rem)]";
