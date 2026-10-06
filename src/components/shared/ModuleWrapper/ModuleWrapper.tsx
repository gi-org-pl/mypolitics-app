import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import infoIcon from "@/assets/icons/info.svg";
import statisticsIcon from "@/assets/icons/statistics.svg";

import type { ModuleWrapperProps } from "./ModuleWrapper.types";

const TOUCH_AREA_CLASS_NAME =
  "relative before:absolute before:-inset-y-1.5 before:content-['']";

const toSingleLine = (text?: string): string =>
  text?.replace(/\s+/g, " ").trim() ?? "";

const isEmptyNode = (node: ReactNode): boolean =>
  node === null ||
  node === undefined ||
  typeof node === "boolean" ||
  node === "";

const renderAction = (
  name: string,
  icon: string,
  touchAreaClassName: string,
  onClick: () => void,
) => (
  <Button
    type="ghost"
    variant="primary"
    size="small"
    isIconButton
    aria-label={name}
    className={`${TOUCH_AREA_CLASS_NAME} ${touchAreaClassName}`}
    onClick={() => onClick()}
  >
    <img src={icon} alt="" />
  </Button>
);

export const ModuleWrapper = ({
  title,
  ariaLabel,
  onStatsClick,
  onInfoClick,
  children,
}: ModuleWrapperProps) => {
  const { t } = useLingui();

  const textTitle = typeof title === "string" ? toSingleLine(title) : "";
  const hasTextTitle = textTitle !== "";
  const hasComponentTitle = typeof title !== "string" && !isEmptyNode(title);
  const hasActions = Boolean(onStatsClick || onInfoClick);
  const hasHeader = hasTextTitle || hasComponentTitle || hasActions;

  const name = hasTextTitle ? textTitle : toSingleLine(ariaLabel);
  const statsName = name ? t`Statystyki: ${name}` : t`Statystyki`;
  const infoName = name ? t`Informacje: ${name}` : t`Informacje`;

  return (
    <section
      aria-label={name || undefined}
      className="flex min-w-0 flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gi-ash ring-inset"
    >
      {hasHeader && (
        <>
          <div className="flex h-8 items-center gap-4">
            {hasTextTitle && (
              <h2 className="h-8 min-w-0 flex-1 truncate rounded-lg border border-gi-ash px-4 text-center text-base leading-[30px] font-bold text-gi-primary">
                {textTitle}
              </h2>
            )}
            {hasComponentTitle && (
              <div
                data-testid="module-wrapper-title-slot"
                className="grid h-8 min-w-0 flex-1 overflow-hidden"
              >
                {title}
              </div>
            )}
            {hasActions && (
              <div className="ml-auto flex shrink-0 gap-2">
                {onStatsClick &&
                  renderAction(
                    statsName,
                    statisticsIcon,
                    "before:-left-2 before:-right-1",
                    onStatsClick,
                  )}
                {onInfoClick &&
                  renderAction(
                    infoName,
                    infoIcon,
                    "before:-left-1 before:-right-2",
                    onInfoClick,
                  )}
              </div>
            )}
          </div>
          <hr className="-mx-4 -mb-px border-gi-ash" />
        </>
      )}
      {!isEmptyNode(children) && <div className="min-w-0">{children}</div>}
    </section>
  );
};
