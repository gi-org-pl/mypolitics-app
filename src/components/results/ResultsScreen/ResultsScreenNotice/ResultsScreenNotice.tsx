import { Button } from "@gi-org-pl/athena";
import { Trans, useLingui } from "@lingui/react/macro";

import { TALL_BUTTON_CLASS_NAME } from "@/constants/button";
import { NOTICE_CARD_CLASS_NAME } from "@/constants/notice";

import { RESULTS_NOTICES } from "./ResultsScreenNotice.constants";
import type { ResultsScreenNoticeProps } from "./ResultsScreenNotice.types";

// A state of the screen that has no result to show: what it is, what to do
// about it where there is something to do, and the retry where loading again
// can help.
export const ResultsScreenNotice = ({
  status,
  onRetry,
}: ResultsScreenNoticeProps) => {
  const { t } = useLingui();
  const { role, title, line, isHeading, canRetry } = RESULTS_NOTICES[status];
  const Title = isHeading ? "h1" : "p";

  return (
    <div role={role} className={NOTICE_CARD_CLASS_NAME}>
      <div className="flex w-full flex-col gap-2">
        <Title className="text-lg leading-[21px] font-bold">{t(title)}</Title>
        {line && <p>{t(line)}</p>}
      </div>
      {canRetry && (
        <Button
          type="primary"
          variant="primary"
          onClick={onRetry}
          className={TALL_BUTTON_CLASS_NAME}
        >
          <Trans>Spróbuj ponownie</Trans>
        </Button>
      )}
    </div>
  );
};
