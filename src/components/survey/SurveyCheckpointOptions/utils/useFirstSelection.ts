import { useCallback, useRef } from "react";

// Lets the first selection through and no other: a choice that is made once
// and cannot be changed. Every later call does nothing, whatever it carries.
export const useFirstSelection = <Value>(
  onSelect: (value: Value) => void,
): ((value: Value) => void) => {
  const hasSelected = useRef(false);

  return useCallback(
    (value: Value) => {
      if (hasSelected.current) return;

      hasSelected.current = true;
      onSelect(value);
    },
    [onSelect],
  );
};
