import { type RefObject, useEffect, useRef, useState } from "react";

import type { AxisGroup } from "../MultiAxisChart.types";

export interface OpenGroupState {
  openGroup?: AxisGroup;
  bodyRef: RefObject<HTMLDivElement | null>;
  openGroupById: (groupId: string) => void;
  closeGroup: () => void;
  setCloseControlFocused: (isFocused: boolean) => void;
}

export const useOpenGroup = (groups: AxisGroup[]): OpenGroupState => {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnGroupIdRef = useRef<string | null>(null);
  const shouldMoveFocusRef = useRef(false);
  const isCloseControlFocusedRef = useRef(false);

  const openGroup =
    openGroupId === null
      ? undefined
      : groups.find(
          (group) => group.axes[0].id === openGroupId && group.axes.length > 1,
        );
  const isOpen = openGroup !== undefined;
  const isOpenGroupGone = openGroupId !== null && !isOpen;

  useEffect(() => {
    if (isOpenGroupGone) setOpenGroupId(null);
  }, [isOpenGroupGone]);

  useEffect(() => {
    const shouldMoveFocus =
      shouldMoveFocusRef.current ||
      (!isOpen && isCloseControlFocusedRef.current);

    shouldMoveFocusRef.current = false;
    isCloseControlFocusedRef.current = false;

    const body = bodyRef.current;

    if (!shouldMoveFocus || !body) return;

    const controls = Array.from(body.querySelectorAll("button"));
    const target =
      controls.find(
        (control) => control.dataset.groupId === returnGroupIdRef.current,
      ) ??
      controls[0] ??
      body;

    target.focus();
  }, [isOpen]);

  return {
    openGroup,
    bodyRef,
    openGroupById: (groupId) => {
      returnGroupIdRef.current = groupId;
      shouldMoveFocusRef.current = true;
      setOpenGroupId(groupId);
    },
    closeGroup: () => {
      shouldMoveFocusRef.current = true;
      setOpenGroupId(null);
    },
    setCloseControlFocused: (isFocused) => {
      isCloseControlFocusedRef.current = isFocused;
    },
  };
};
