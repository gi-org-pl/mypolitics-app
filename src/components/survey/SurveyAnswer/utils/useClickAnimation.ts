import { useEffect, useRef, useState } from "react";
import { RIPPLE_FADE_MS } from "../SurveyAnswer.constants";

export interface AnimationCSSProperties extends React.CSSProperties {
  "--cx": string;
  "--cy": string;
  "--size": string;
}

type AnimationPhase = "expanding" | "fading" | false;

interface UseClickAnimationReturn {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  iconRef: React.RefObject<HTMLSpanElement | null>;
  style: AnimationCSSProperties;
  triggerAnimation: () => void;
  animationPhase: AnimationPhase;
  handleRippleTransitionEnd: () => void;
}

const EMPTY_DEPS: unknown[] = [];

export function useClickAnimation(
  deps: unknown[] = EMPTY_DEPS,
): UseClickAnimationReturn {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);

  const [style, setStyle] = useState<AnimationCSSProperties>({
    "--cx": "50%",
    "--cy": "50%",
    "--size": "0px",
  });

  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(false);

  const triggerAnimation = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    generationRef.current += 1;
    const generation = generationRef.current;

    setAnimationPhase(false);
    requestAnimationFrame(() => {
      if (generationRef.current === generation) {
        setAnimationPhase("expanding");
      }
    });
  };

  const handleRippleTransitionEnd = () => {
    if (animationPhase !== "expanding") return;

    const generation = generationRef.current;
    setAnimationPhase("fading");
    fadeTimeoutRef.current = setTimeout(() => {
      if (generationRef.current === generation) {
        setAnimationPhase(false);
      }
      fadeTimeoutRef.current = null;
    }, RIPPLE_FADE_MS);
  };

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const calculate = () => {
      if (!buttonRef.current || !iconRef.current) return;

      const btnRect = buttonRef.current.getBoundingClientRect();
      const iconRect = iconRef.current.getBoundingClientRect();

      if (btnRect.width === 0) return;

      const cx = iconRect.left - btnRect.left + iconRect.width / 2;
      const cy = iconRect.top - btnRect.top + iconRect.height / 2;

      const corners = [
        [0, 0],
        [btnRect.width, 0],
        [0, btnRect.height],
        [btnRect.width, btnRect.height],
      ];

      const size = Math.max(
        ...corners.map(([x, y]) => Math.sqrt((cx - x) ** 2 + (cy - y) ** 2)),
      );

      setStyle({ "--cx": `${cx}px`, "--cy": `${cy}px`, "--size": `${size}px` });
    };

    const raf = requestAnimationFrame(calculate);
    window.addEventListener("resize", calculate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", calculate);
    };
  }, deps ?? []);

  return {
    buttonRef,
    iconRef,
    style,
    triggerAnimation,
    animationPhase,
    handleRippleTransitionEnd,
  };
}
