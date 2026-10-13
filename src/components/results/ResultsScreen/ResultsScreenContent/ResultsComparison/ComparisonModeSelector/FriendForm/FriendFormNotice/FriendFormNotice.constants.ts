import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import { FriendNotice } from "../FriendForm.types";

// What the line under the field of the friend says, by notice.
export const FRIEND_NOTICE_TEXTS: Record<FriendNotice, MessageDescriptor> = {
  [FriendNotice.Hint]: msg`Wymień się identyfikatorami wyników ze znajomym, aby porównać wzajemnie swoje odpowiedzi.`,
  [FriendNotice.Fetching]: msg`Wczytujemy wynik…`,
  [FriendNotice.Invalid]: msg`To nie jest identyfikator wyników.`,
  [FriendNotice.Own]: msg`To jest Twój identyfikator.`,
  [FriendNotice.OtherSurvey]: msg`Ten wynik pochodzi z innego quizu.`,
  [FriendNotice.Unreadable]: msg`Nie znaleźliśmy takiego wyniku.`,
};
