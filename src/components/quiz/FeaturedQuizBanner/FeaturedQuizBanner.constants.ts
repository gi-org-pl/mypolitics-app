// The picture drifts in a slow loop. The keyframes travel with the component:
// they belong to this animation alone.
export const FLOAT_KEYFRAMES = `
  @keyframes quiz-banner-float {
    0%,
    100% {
      transform: translate(0px, 0px);
    }
    25% {
      transform: translate(6px, -6px);
    }
    50% {
      transform: translate(0px, -10px);
    }
    75% {
      transform: translate(-6px, -6px);
    }
  }
`;

// The picture is taller than the banner by the distance it drifts, so its
// edge never shows; reduced motion keeps it still.
export const FLOAT_CLASS_NAME =
  "h-[calc(100%+30px)] animate-[quiz-banner-float_4s_ease-in-out_infinite] motion-reduce:animate-none";
