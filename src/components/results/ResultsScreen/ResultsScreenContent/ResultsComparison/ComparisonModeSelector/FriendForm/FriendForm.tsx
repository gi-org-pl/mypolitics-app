import { Input } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { useId } from "react";

import {
  FIELD_BORDER_CLASS_NAME,
  FIELD_CLASS_NAME,
  FRIEND_ID_PLACEHOLDER,
  IS_NOTICE_ERROR,
  LABEL_CLASS_NAME,
  PART_CLASS_NAME,
} from "./FriendForm.constants";
import { type FriendFormProps, FriendNotice } from "./FriendForm.types";
import { FriendFormIdentifier } from "./FriendFormIdentifier/FriendFormIdentifier";
import { FriendFormNotice } from "./FriendFormNotice/FriendFormNotice";

// How a taker is paired with a friend: the identifier of their own result, to
// copy and hand over, and a field for the identifier the friend handed them.
// Nothing is looked up by name, and the field is all there is: the result is
// asked for as soon as the text is an identifier, with no button to press.
//
// The line under the field is the hint, and in its place whatever the field
// has to say: that the result is on the way, that the text is no identifier,
// or why the result cannot be used. While the result is on the way the field
// cannot be changed.
//
// Athena's Input describes the input with its own helper and nothing else,
// so the line is given to a group around the field.
export const FriendForm = ({
  resultId,
  friendId,
  notice,
  onFriendIdChange,
}: FriendFormProps) => {
  const { t } = useLingui();
  const ownLabelId = useId();
  const fieldId = useId();
  const noticeId = useId();
  const isError = IS_NOTICE_ERROR[notice];
  const isFetching = notice === FriendNotice.Fetching;

  return (
    <div className="flex w-full min-w-0 flex-col rounded-2xl border border-gi-dark-ash">
      <div
        role="group"
        aria-labelledby={ownLabelId}
        className={PART_CLASS_NAME}
      >
        <p id={ownLabelId} className={LABEL_CLASS_NAME}>
          {t`Mój identyfikator wyników`}
        </p>
        <FriendFormIdentifier identifier={resultId} />
      </div>
      <div className={`${PART_CLASS_NAME} border-t border-gi-dark-ash`}>
        <label htmlFor={fieldId} className={LABEL_CLASS_NAME}>
          {t`Identyfikator wyników znajomego`}
        </label>
        <div role="group" aria-describedby={noticeId}>
          <Input
            id={fieldId}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={FRIEND_ID_PLACEHOLDER}
            value={friendId}
            isError={isError}
            readOnly={isFetching}
            aria-busy={isFetching}
            className={`${FIELD_CLASS_NAME} ${isError ? "" : FIELD_BORDER_CLASS_NAME}`}
            onChange={onFriendIdChange}
          />
        </div>
        <FriendFormNotice id={noticeId} notice={notice} isError={isError} />
      </div>
    </div>
  );
};
