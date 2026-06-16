import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { useEffect, useState } from "react";
import { Checkbox } from "@gi/athena";
import {
  DEFAULT_MAX_SELECTION,
  LOCK_TRANSITION_MS,
  ROW_STAGGER_MS,
} from "./SurveyCategorySelect.constants";
import type { SurveyCategorySelectProps } from "./SurveyCategorySelect.types";
import { toggleSelection } from "./utils/toggleSelection";

export function SurveyCategorySelect({
  categories,
  selectedIds,
  onChange,
  maxSelection = DEFAULT_MAX_SELECTION,
  prompt,
}: SurveyCategorySelectProps) {
  useLingui();
  const [visibleRows, setVisibleRows] = useState<boolean[]>(
    () => categories.map(() => false),
  );

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    categories.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleRows((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, index * ROW_STAGGER_MS);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [categories]);

  const isAtMax = selectedIds.length === maxSelection;

  const handleChange = (id: string) => {
    const newIds = toggleSelection(selectedIds, id, maxSelection);
    if (newIds !== selectedIds) {
      onChange(newIds);
    }
  };

  const defaultPrompt = t`Wybierz ${maxSelection} najważniejsze dla Ciebie tematy.`;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-full bg-gi-primary px-5 py-3 text-white font-roboto font-bold text-base">
        {prompt ?? defaultPrompt}
      </div>

      <div className="flex flex-col gap-2">
        {categories.map((category, index) => {
          const isChecked = selectedIds.includes(category.id);
          const isDisabled = isAtMax && !isChecked;

          return (
            <div
              key={category.id}
              style={{
                opacity: visibleRows[index] ? 1 : 0,
                transform: visibleRows[index]
                  ? "translateY(0)"
                  : "translateY(4px)",
                transition: `opacity ${ROW_STAGGER_MS}ms ease, transform ${ROW_STAGGER_MS}ms ease`,
              }}
            >
              <div
                style={{
                  transition: isDisabled
                    ? `opacity ${LOCK_TRANSITION_MS}ms ease`
                    : undefined,
                }}
                className={[
                  "w-full flex items-center rounded-3xl border px-4 h-14",
                  isChecked
                    ? "border-gi-dark-ash"
                    : "border-gi-light-ash",
                ].join(" ")}
              >
                <Checkbox
                  label={category.name}
                  checked={isChecked}
                  disabled={isDisabled}
                  onCheckedChange={() => handleChange(category.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}