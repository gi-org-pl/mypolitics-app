import { type RefObject, useEffect, useRef, useState } from "react";

type FocusTarget = { key: string } | "return" | null;

interface OpenCategory {
  openKey: string | null;
  open: (key: string) => void;
  close: () => void;
  registerControl: (key: string) => (node: HTMLButtonElement | null) => void;
  returnControl: RefObject<HTMLButtonElement | null>;
}

export const useOpenCategory = (keys: string[]): OpenCategory => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const categoryControls = useRef(new Map<string, HTMLButtonElement>());
  const returnControl = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<FocusTarget>(null);

  const listedOpenKey =
    openKey !== null && keys.includes(openKey) ? openKey : null;
  const isOpenKeyStale = openKey !== null && listedOpenKey === null;

  useEffect(() => {
    if (isOpenKeyStale) setOpenKey(null);
  }, [isOpenKeyStale]);

  useEffect(() => {
    const target = focusTarget.current;

    focusTarget.current = null;

    if (target === "return") returnControl.current?.focus();
    else if (target) categoryControls.current.get(target.key)?.focus();
  });

  return {
    openKey: listedOpenKey,
    open: (key) => {
      focusTarget.current = "return";
      setOpenKey(key);
    },
    close: () => {
      focusTarget.current = listedOpenKey ? { key: listedOpenKey } : null;
      setOpenKey(null);
    },
    registerControl: (key) => (node) => {
      if (node) categoryControls.current.set(key, node);
      else categoryControls.current.delete(key);
    },
    returnControl,
  };
};
