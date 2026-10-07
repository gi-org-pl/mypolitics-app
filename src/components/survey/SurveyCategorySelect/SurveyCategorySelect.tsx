import { useId } from "react";

import { uniqueBy } from "@/utils/array/uniqueBy";

import type { SurveyCategorySelectProps } from "./SurveyCategorySelect.types";
import { SurveyCategorySelectPrompt } from "./SurveyCategorySelectPrompt/SurveyCategorySelectPrompt";
import { SurveyCategorySelectRow } from "./SurveyCategorySelectRow/SurveyCategorySelectRow";
import { getMaxSelection } from "./utils/getMaxSelection";
import { getValidSelection } from "./utils/getValidSelection";
import { toggleSelection } from "./utils/toggleSelection";

export function SurveyCategorySelect({
  categories,
  selectedIds,
  onChange,
  maxSelection,
  prompt,
}: SurveyCategorySelectProps) {
  const promptId = useId();
  const limit = getMaxSelection(maxSelection);
  const rows = uniqueBy(categories, (category) => category.id);
  const selection = getValidSelection(selectedIds, rows);
  const isAtLimit = selection.length >= limit;

  return (
    <div
      role="group"
      aria-labelledby={promptId}
      className="flex w-full flex-col gap-4"
    >
      <SurveyCategorySelectPrompt id={promptId} count={limit} prompt={prompt} />
      {rows.length > 0 && (
        <ul className="flex w-full flex-col gap-2">
          {rows.map((category, index) => (
            <SurveyCategorySelectRow
              key={category.id}
              name={category.name}
              index={index}
              isSelected={selection.includes(category.id)}
              isDisabled={isAtLimit && !selection.includes(category.id)}
              onToggle={() =>
                onChange(toggleSelection(selection, category.id, limit))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
