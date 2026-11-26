import megaphoneIcon from "@/assets/icons/megaphone.svg";

import type { ResultsHeaderSloganProps } from "./ResultsHeaderSlogan.types";

// The slogan of the orientation the header names, as a chip. It is that
// orientation's own line, so it wraps and is never cut: quizzes in use have
// slogans of up to 42 characters, which one line of the chip does not hold at
// any width. The icon stays beside the first line.
export const ResultsHeaderSlogan = ({ text }: ResultsHeaderSloganProps) => (
  <p
    data-testid="results-header-slogan"
    className="flex max-w-full min-w-0 items-start gap-2 rounded-lg border border-gi-dark-ash px-2 py-[7px] text-base font-bold text-gi-primary"
  >
    <img src={megaphoneIcon} alt="" className="mt-px shrink-0" />
    <span className="min-w-0 leading-[18px] wrap-break-word">{text}</span>
  </p>
);
