import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";

interface HorizontalBarChartEmptyProps {
  text: string;
}

// A ranking with nothing to rank: the author's line for that, quiet, where a
// name would stand, over an empty track - as a card says that nothing
// matches. The line is the whole content of the card, so it wraps and is
// never cut.
export const HorizontalBarChartEmpty = ({
  text,
}: HorizontalBarChartEmptyProps) => (
  <div
    data-testid="horizontal-bar-chart-empty"
    className="flex w-full min-w-0 flex-col gap-2"
  >
    <p className="-my-0.5 min-h-5 min-w-0 text-base leading-5 font-bold wrap-break-word text-gi-primary/50">
      {text}
    </p>
    <UniversalAxis marker={false} />
  </div>
);
