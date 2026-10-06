import { useLingui } from "@lingui/react/macro";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import type { AxisEntry } from "@/components/shared/UniversalAxis/UniversalAxis.types";
import { getAxisLayout } from "@/components/shared/UniversalAxis/utils/getAxisLayout";
import type { ResultEntry } from "@/types/results";
import { getAxisLead } from "@/utils/results/getAxisLead";

import { AxisRow } from "../AxisRow/AxisRow";
import type {
  AxisGroup,
  AxisPair,
  MultiAxisChartProps,
} from "./MultiAxisChart.types";

const CONTROL_CLASS_NAME =
  "relative w-full cursor-pointer rounded-b-2xl outline-none transition-colors duration-300 before:absolute before:inset-x-0 before:content-[''] focus-visible:ring-[3px] focus-visible:ring-gi-secondary/50 focus-visible:ring-inset";
const GROUP_FOOT_CLASS_NAME = "border-x border-b border-gi-ash";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

const getEntryName = (entry?: ResultEntry): string =>
  toSingleLine(entry?.orientation?.name);

const getLeadName = (axis: AxisPair): string => {
  const lead = getAxisLead(axis.start?.value, axis.end?.value);

  return lead === null ? "" : getEntryName(axis[lead]);
};

const getPreviewIcons = (axes: AxisPair[], side: "start" | "end"): string[] =>
  axes
    .map((axis) => axis[side]?.orientation?.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

const renderPreview = (
  axes: AxisPair[],
  side: "start" | "end",
  className: string,
) => (
  <span
    data-testid={`multi-axis-chart-preview-${side}`}
    className={`flex h-4 min-w-0 flex-wrap overflow-hidden pl-1 ${className}`}
  >
    {getPreviewIcons(axes, side).map((imageUrl, index) => (
      <span
        key={index}
        className="-ml-1 size-4 shrink-0 rounded-full bg-white ring-1 ring-gi-ash ring-inset"
      >
        <img
          src={imageUrl}
          alt=""
          className="size-4 object-cover opacity-40 brightness-0"
        />
      </span>
    ))}
  </span>
);

export const MultiAxisChart = ({
  title,
  groups,
  marker,
  comparison,
  onStatsClick,
  onInfoClick,
}: MultiAxisChartProps) => {
  const { t } = useLingui();

  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnGroupIdRef = useRef<string | null>(null);
  const shouldMoveFocusRef = useRef(false);
  const isCloseControlFocusedRef = useRef(false);

  const drawnGroups = (Array.isArray(groups) ? groups : []).filter(
    (group) => Array.isArray(group?.axes) && group.axes.length > 0,
  );
  const openGroup =
    openGroupId === null
      ? undefined
      : drawnGroups.find(
          (group) => group.axes[0].id === openGroupId && group.axes.length > 1,
        );
  const isOpen = openGroup !== undefined;
  const isOpenGroupGone = openGroupId !== null && !isOpen;

  useEffect(() => {
    if (isOpenGroupGone) setOpenGroupId(null);
  }, [isOpenGroupGone]);

  useEffect(() => {
    const shouldMoveFocus =
      shouldMoveFocusRef.current ||
      (!isOpen && isCloseControlFocusedRef.current);

    shouldMoveFocusRef.current = false;
    isCloseControlFocusedRef.current = false;

    const body = bodyRef.current;

    if (!shouldMoveFocus || !body) return;

    const controls = Array.from(body.querySelectorAll("button"));
    const target =
      controls.find(
        (control) => control.dataset.groupId === returnGroupIdRef.current,
      ) ??
      controls[0] ??
      body;

    target.focus();
  }, [isOpen]);

  const openGroupById = (groupId: string) => {
    returnGroupIdRef.current = groupId;
    shouldMoveFocusRef.current = true;
    setOpenGroupId(groupId);
  };

  const closeGroup = () => {
    shouldMoveFocusRef.current = true;
    setOpenGroupId(null);
  };

  const getComparison = (axis: AxisPair): AxisEntry | undefined => {
    const value = comparison?.values?.[axis.id];

    return comparison?.party && typeof value === "number"
      ? { orientation: comparison.party, value }
      : undefined;
  };

  const getGroupLabel = (group: AxisGroup): string => {
    const [headline] = group.axes;
    const startName = getEntryName(headline.start);
    const endName = getEntryName(headline.end);
    const tieName =
      startName && endName
        ? t`${startName} / ${endName}`
        : startName || endName;

    return toSingleLine(group.name) || getLeadName(headline) || tieName;
  };

  const renderRow = (
    axis: AxisPair,
    rowMarker: number | false | undefined,
    group?: AxisGroup,
  ) => (
    <AxisRow
      name={group?.name}
      leadName={group && getLeadName(axis)}
      start={axis.start}
      end={axis.end}
      marker={rowMarker}
      comparison={getComparison(axis)}
      showLabels
    />
  );

  const renderClosedGroup = (group: AxisGroup) => {
    const [headline] = group.axes;
    const name = getGroupLabel(group);

    return (
      <li key={headline.id} data-testid="multi-axis-chart-group">
        <div className="px-4">{renderRow(headline, marker, group)}</div>
        {group.axes.length > 1 ? (
          <button
            type="button"
            data-group-id={headline.id}
            aria-expanded={false}
            aria-label={name ? t`Pokaż grupę: ${name}` : t`Pokaż grupę`}
            className={`${CONTROL_CLASS_NAME} ${GROUP_FOOT_CLASS_NAME} grid grid-cols-[1fr_auto_1fr] items-center px-[15px] py-2 before:-inset-y-1.5 hover:bg-gi-ash/50`}
            onClick={() => openGroupById(headline.id)}
          >
            {renderPreview(group.axes, "start", "justify-start")}
            <img src={chevronDownIcon} alt="" className="mx-3" />
            {renderPreview(group.axes, "end", "justify-end")}
          </button>
        ) : (
          <div className={`h-[17px] rounded-b-2xl ${GROUP_FOOT_CLASS_NAME}`} />
        )}
      </li>
    );
  };

  const renderOpenGroup = (group: AxisGroup) => {
    const [headline, ...otherAxes] = group.axes;
    const name = getGroupLabel(group);
    const hasHeading = Boolean(
      toSingleLine(group.name) || getLeadName(headline),
    );
    const markerPosition = getAxisLayout({ marker }).marker;

    return (
      <>
        <div
          data-testid="multi-axis-chart-open-group"
          className="relative flex flex-col gap-3 px-4 pb-4"
        >
          {renderRow(headline, false, group)}
          <hr className="-mx-4 -mb-px border-gi-ash" />
          {otherAxes.map((axis) => (
            <div key={axis.id}>{renderRow(axis, false)}</div>
          ))}
          {markerPosition !== null && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-9 bottom-8 ${hasHeading ? "top-6" : "top-0"}`}
            >
              <div
                data-testid="multi-axis-chart-marker"
                className="absolute inset-y-0 left-[clamp(0px,calc(var(--axis-position)-0.5px),calc(100%-1px))] w-px bg-gi-primary/30"
                style={
                  { "--axis-position": `${markerPosition}%` } as CSSProperties
                }
              />
            </div>
          )}
        </div>
        <button
          type="button"
          aria-expanded
          aria-label={
            name ? t`Wróć do grup, zamknij grupę: ${name}` : t`Wróć do grup`
          }
          className={`${CONTROL_CLASS_NAME} flex h-[33px] items-center justify-center bg-gi-ash before:-top-3 before:bottom-0 hover:bg-gi-dark-ash`}
          onClick={closeGroup}
          onFocus={() => {
            isCloseControlFocusedRef.current = true;
          }}
          onBlur={() => {
            isCloseControlFocusedRef.current = false;
          }}
        >
          <img src={chevronDownIcon} alt="" className="rotate-180" />
        </button>
      </>
    );
  };

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {drawnGroups.length > 0 && (
        <div ref={bodyRef} tabIndex={-1} className="-mx-4 -mb-4 outline-none">
          {openGroup ? (
            renderOpenGroup(openGroup)
          ) : (
            <ul className="flex flex-col gap-4">
              {drawnGroups.map(renderClosedGroup)}
            </ul>
          )}
        </div>
      )}
    </ModuleWrapper>
  );
};
