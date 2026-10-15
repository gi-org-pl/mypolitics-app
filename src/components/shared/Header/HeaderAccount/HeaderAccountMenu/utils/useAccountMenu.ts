import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

// The open state of the account menu, like the phone menu of the header:
// it closes on a press outside it and on Escape, which gives focus back to
// the pill that opened it.
export const useAccountMenu = () => {
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return {
    menuId,
    isOpen,
    menuRef,
    buttonRef,
    toggle: () => setIsOpen((open) => !open),
    close: () => setIsOpen(false),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isOpen) return;

      setIsOpen(false);
      buttonRef.current?.focus();
    },
  };
};
