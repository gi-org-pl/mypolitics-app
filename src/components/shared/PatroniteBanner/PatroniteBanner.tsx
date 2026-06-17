import { Button } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import type { FC } from "react";
import type { PatroniteBannerProps } from "./PatroniteBanner.types";

export const PatroniteBanner: FC<PatroniteBannerProps> = ({
  href,
  ctaLabel,
  id,
}) => {
  return (
    <section
      id={id}
      className="w-full rounded-3xl border border-gi-primary bg-gi-ash p-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-col">
        <p className="text-gi-primary/50 text-base font-bold leading-[1.2] tracking-normal">
          <Trans>Nikt nas nie finansuje… poza Wami!</Trans>
        </p>
        <p className="text-gi-primary text-base font-bold leading-[1.2] tracking-normal">
          <Trans>Wesprzyj naszą działalność:</Trans>
        </p>
      </div>

      <Button asChild variant="primary">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      </Button>
    </section>
  );
};
