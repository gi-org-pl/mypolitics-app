import { Button } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import React from "react";
import type { PatroniteBannerProps } from "./PatroniteBanner.types";

export const PatroniteBanner: React.FC<PatroniteBannerProps> = ({
  href,
  ctaLabel,
  id,
}) => {
  return (
    <section
      id={id}
      className="w-full rounded-3xl border border-gi-primary bg-gi-ash p-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
    >
      <p className="text-gi-primary/50 text-base font-bold leading-[1.2] tracking-normal">
        <Trans>Nikt nas nie finansuje… poza Wami!</Trans>
        <span className="text-gi-primary block">
          <Trans>Wesprzyj naszą działalność:</Trans>
        </span>
      </p>

      <Button asChild variant="primary" className="rounded-full">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      </Button>
    </section>
  );
};
