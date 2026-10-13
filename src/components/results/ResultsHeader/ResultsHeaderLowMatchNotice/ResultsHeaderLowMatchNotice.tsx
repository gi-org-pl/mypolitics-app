import { BAND_CLASS_NAME } from "../ResultsHeader.constants";

interface ResultsHeaderLowMatchNoticeProps {
  text: string;
}

// What the header says under an orientation it names below a partial match:
// the author's line, in the colour of that band on a tint of it. It is the
// taker's own result that it qualifies, so it wraps and is never cut.
export const ResultsHeaderLowMatchNotice = ({
  text,
}: ResultsHeaderLowMatchNoticeProps) => (
  <p
    data-testid="results-header-low-match-notice"
    className={`rounded-lg bg-current/10 px-4 py-3 ${BAND_CLASS_NAME.none}`}
  >
    <span className="text-sm leading-[1.5] font-bold wrap-break-word">
      {text}
    </span>
  </p>
);
