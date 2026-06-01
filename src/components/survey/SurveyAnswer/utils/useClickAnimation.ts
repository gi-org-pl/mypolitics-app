import { useEffect, useRef, useState } from "react";

export interface AnimationCSSProperties extends React.CSSProperties {
  "--cx": string;
  "--cy": string;
  "--size": string;
}

interface UseClickAnimationReturn {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  iconRef: React.RefObject<HTMLSpanElement | null>;
  style: AnimationCSSProperties;
  triggerAnimation: () => void;
  isAnimating: boolean;
}

export function useClickAnimation(
  deps: unknown[] = [],
): UseClickAnimationReturn {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const [style, setStyle] = useState<AnimationCSSProperties>({
    "--cx": "0px",
    "--cy": "50%",
    "--size": "0px",
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);
  };

  useEffect(() => {
    const calculate = () => {
      if (!buttonRef.current || !iconRef.current) return;

      const btnRect = buttonRef.current.getBoundingClientRect();
      const iconRect = iconRef.current.getBoundingClientRect();

      const cx = iconRect.left - btnRect.left + iconRect.width / 2;
      const cy = iconRect.top - btnRect.top + iconRect.height / 2;

      const diagonal = Math.sqrt(btnRect.width ** 2 + btnRect.height ** 2);
      const size = diagonal + 20;

      setStyle({
        "--cx": `${cx}px`,
        "--cy": `${cy}px`,
        "--size": `${size}px`,
      });
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, deps);

  return { buttonRef, iconRef, style, triggerAnimation, isAnimating };
}
