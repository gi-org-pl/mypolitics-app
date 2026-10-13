import type { FriendNotice } from "../FriendForm.types";

export interface FriendFormNoticeProps {
  id: string; // what the field is described by
  notice: FriendNotice;
  isError: boolean; // the notice says that the text of the field cannot be used
}
