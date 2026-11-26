import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import { RankedRow } from "@/components/results/RankedRow/RankedRow";
import { FOCUS_CLASS_NAME } from "@/constants/focus";

import type { AgreementBarProps } from "./AgreementBar.types";

// What stands on top of a running comparison: who the other side is, how
// much the two agree, and the way out.
//
// The score is drawn as every other value of a result is - one bar, capped
// with the image of the other side, the number on it - under a line that
// names it in words: "Agreement - <the other side>". Without a score the bar
// is drawn without a value, and says so.
//
// It is a container: stacked while it is narrow, and with the control beside
// the bar once both fit in one row, whatever stands around it.
export const AgreementBar = ({ other, score, onEnd }: AgreementBarProps) => {
  const { t } = useLingui();

  return (
    <section aria-label={t`Zgodność`} className="@container w-full min-w-0">
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-gi-ash p-4 @lg:flex-row @lg:items-center @lg:justify-between">
        <div className="w-full min-w-0 @lg:w-72">
          <RankedRow
            entry={{ orientation: other, value: score }}
            prefix={t`Zgodność`}
          />
        </div>
        <Button
          type="ghost"
          variant="primary"
          size="small"
          className={`h-8 max-w-full shrink-0 rounded-full bg-gi-dark-ash px-4 text-base font-bold hover:bg-gi-ash-hover ${FOCUS_CLASS_NAME}`}
          onClick={onEnd}
        >
          {t`Cofnij porównanie`}
        </Button>
      </div>
    </section>
  );
};
