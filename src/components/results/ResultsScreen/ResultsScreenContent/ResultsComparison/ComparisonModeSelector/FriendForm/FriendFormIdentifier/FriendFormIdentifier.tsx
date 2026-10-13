import { useLingui } from "@lingui/react/macro";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { useCopyText } from "@/utils/dom/useCopyText";

import {
  COPY_ICONS,
  COPY_STATUS,
  COPY_STATUS_CLASS_NAME,
  DEFAULT_COPY_ICON,
} from "./FriendFormIdentifier.constants";

interface FriendFormIdentifierProps {
  identifier: string; // the result identifier that is shown and copied
}

// The identifier of the taker's own result, with the control that copies it.
// It is written out in full, on as many lines as it takes, and selected whole
// with one press, so it can always be copied by hand: the control uses the
// Clipboard API, which a browser may lack or refuse. How the copy ended is
// said under the identifier.
export const FriendFormIdentifier = ({
  identifier,
}: FriendFormIdentifierProps) => {
  const { i18n, t } = useLingui();
  const { outcome, copy } = useCopyText(identifier);

  return (
    <>
      <div className="flex min-h-8 min-w-0 items-center justify-between gap-2 rounded-2xl bg-gi-ash py-1 pr-2 pl-4">
        <span className="min-w-0 py-1 text-xs leading-3.5 font-bold break-all text-gi-light-primary select-all">
          {identifier}
        </span>
        <button
          type="button"
          aria-label={t`Skopiuj identyfikator`}
          className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-gi-dark-ash ${FOCUS_CLASS_NAME}`}
          onClick={copy}
        >
          <img
            src={outcome ? COPY_ICONS[outcome] : DEFAULT_COPY_ICON}
            alt=""
            className="h-4 w-auto"
          />
        </button>
      </div>
      <p
        role="status"
        className={outcome ? COPY_STATUS_CLASS_NAME[outcome] : "sr-only"}
      >
        {outcome && i18n._(COPY_STATUS[outcome])}
      </p>
    </>
  );
};
