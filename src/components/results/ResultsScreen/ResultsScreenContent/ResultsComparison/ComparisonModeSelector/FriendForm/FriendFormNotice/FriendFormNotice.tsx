import { useLingui } from "@lingui/react/macro";

import infoIcon from "@/assets/icons/info.svg";

import { FRIEND_NOTICE_TEXTS } from "./FriendFormNotice.constants";
import type { FriendFormNoticeProps } from "./FriendFormNotice.types";

// The line under the field of the friend: the info mark and one sentence.
// The hint is quiet, as the design draws it; what the field has to say about
// its text is written in the full colour. The line is a status, so a change
// of its sentence is read out without taking the focus.
export const FriendFormNotice = ({
  id,
  notice,
  isError,
}: FriendFormNoticeProps) => {
  const { i18n } = useLingui();

  return (
    <p id={id} role="status" className="flex min-w-0 items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gi-primary/10">
        <img src={infoIcon} alt="" className="opacity-50" />
      </span>
      <span
        className={`min-w-0 text-xs leading-[1.2] font-bold wrap-break-word ${isError ? "text-gi-primary" : "text-gi-primary/50"}`}
      >
        {i18n._(FRIEND_NOTICE_TEXTS[notice])}
      </span>
    </p>
  );
};
