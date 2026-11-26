import { BAND_CLASS_NAME } from "../ResultsHeader.constants";

import type { ResultsHeaderLowMatchNoticeProps } from "./ResultsHeaderLowMatchNotice.types";

// What the header says under an orientation it names below a partial match:
// the author's line on a tint of the colour of that band. The line itself is
// in the primary colour: the red of the band has about 3.3:1 on its own tint,
// and text needs 4.5:1. It is the taker's own result that it qualifies, so it
// wraps and is never cut.
export const ResultsHeaderLowMatchNotice = ({
  text,
}: ResultsHeaderLowMatchNoticeProps) => (
  <p
    data-testid="results-header-low-match-notice"
    className={`rounded-lg bg-current/10 px-4 py-3 ${BAND_CLASS_NAME.none}`}
  >
    <span className="text-sm leading-[1.5] font-bold wrap-break-word text-gi-primary">
      {text}
    </span>
  </p>
);
