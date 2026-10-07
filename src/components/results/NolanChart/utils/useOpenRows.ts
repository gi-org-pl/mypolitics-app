import { useId, useState } from "react";

export interface OpenRowsState {
  isOpen: boolean;
  rowsId: string;
  toggle: () => void;
}

export const useOpenRows = (): OpenRowsState => {
  const rowsId = useId();
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    rowsId,
    toggle: () => setIsOpen((wasOpen) => !wasOpen),
  };
};
