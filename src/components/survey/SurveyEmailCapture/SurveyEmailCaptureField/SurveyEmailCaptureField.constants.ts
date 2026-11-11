// The field and its hint stand in a box that moves its height when the hint
// comes or goes, so the consent and the button under it move instead of
// jumping. A box that moves cuts off what reaches over its top and bottom,
// and the focus outline of the field reaches 4 px over both: the content gets
// 4 px of room on each side and the group is pulled back by as much, so the
// outline is never cut and nothing stands elsewhere than without the box.
export const GROUP_CLASS_NAME = "-my-1 w-full";
export const ROOM_CLASS_NAME = "w-full py-1";
