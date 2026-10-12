import { Button } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";

import downloadIcon from "@/assets/icons/download.svg";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import {
  ACTION_CLASS_NAME,
  ACTION_ICON_CLASS_NAME,
} from "./SurveyResultsCalculationActions.constants";

// The two result actions, in the order of the frame. They show where the wait
// ends and never work here: real buttons that are off, so they are read as
// unavailable and the keyboard skips them. At a narrow width they wrap as a
// pair.
export const SurveyResultsCalculationActions = () => (
  <div className="flex w-full flex-wrap items-center justify-center gap-4">
    <Button
      type="primary"
      variant="primary"
      disabled
      LeftIcon={
        <span
          aria-hidden="true"
          className={ACTION_ICON_CLASS_NAME}
          style={getIconMaskStyle(downloadIcon)}
        />
      }
      className={ACTION_CLASS_NAME}
    >
      <Trans>Pobierz</Trans>
    </Button>
    <Button
      type="primary"
      variant="primary"
      disabled
      className={ACTION_CLASS_NAME}
    >
      <Trans>Pełne wyniki</Trans>
    </Button>
  </div>
);
