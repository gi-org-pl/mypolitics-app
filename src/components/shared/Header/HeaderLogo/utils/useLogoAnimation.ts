import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/utils/motion/prefersReducedMotion";

import { LOGO_ANIMATION_MS, LOGO_REST_PIECES } from "../HeaderLogo.constants";
import type { LogoAnimation, LogoPiece } from "../HeaderLogo.types";
import { getLogoFrame } from "./getLogoFrame";

// Plays the animation of the sign once for every new `playId`, a frame per
// display refresh, and leaves the pieces at rest otherwise. The first render
// is always the logo at rest, so a page rendered before the scripts run and
// the first frame after them are the same picture.
//
// A visit that arrives while the animation plays does not start it again,
// and a visit that needs none does not stop it: the animation always runs to
// its end, which is the logo at rest. Nothing moves under reduced motion.
export const useLogoAnimation = (playId?: string): LogoAnimation => {
  const [frame, setFrame] = useState<LogoPiece[]>();
  const frameRequestRef = useRef<number>(undefined);

  useEffect(() => {
    if (
      playId === undefined ||
      frameRequestRef.current !== undefined ||
      prefersReducedMotion()
    ) {
      return;
    }

    let startedAt: number | undefined;

    const step = (now: number) => {
      startedAt ??= now;

      const elapsedMs = now - startedAt;

      if (elapsedMs >= LOGO_ANIMATION_MS) {
        frameRequestRef.current = undefined;
        setFrame(undefined);

        return;
      }

      setFrame(getLogoFrame(elapsedMs));
      frameRequestRef.current = requestAnimationFrame(step);
    };

    frameRequestRef.current = requestAnimationFrame(step);
  }, [playId]);

  useEffect(
    () => () => {
      if (frameRequestRef.current !== undefined) {
        cancelAnimationFrame(frameRequestRef.current);
        frameRequestRef.current = undefined;
      }
    },
    [],
  );

  return { pieces: frame ?? LOGO_REST_PIECES, isPlaying: frame !== undefined };
};
