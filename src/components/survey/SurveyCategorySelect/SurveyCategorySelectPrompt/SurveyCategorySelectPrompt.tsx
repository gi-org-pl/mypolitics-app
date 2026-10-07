import { Plural } from "@lingui/react/macro";

import type { SurveyCategorySelectPromptProps } from "./SurveyCategorySelectPrompt.types";

export const SurveyCategorySelectPrompt = ({
  id,
  count,
  prompt,
}: SurveyCategorySelectPromptProps) => (
  <div
    id={id}
    className="w-full rounded-3xl bg-gi-light-primary px-4 py-8 text-lg leading-[21px] font-bold wrap-break-word text-white"
  >
    {prompt ?? (
      <Plural
        value={count}
        one="Wybierz # najważniejszy dla Ciebie temat."
        few="Wybierz # najważniejsze dla Ciebie tematy."
        many="Wybierz # najważniejszych dla Ciebie tematów."
        other="Wybierz # najważniejszych dla Ciebie tematów."
      />
    )}
  </div>
);
