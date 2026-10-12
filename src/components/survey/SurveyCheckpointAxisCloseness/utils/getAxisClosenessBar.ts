import type { AxisClosenessCheckpointCard } from "@/types/checkpoint";
import { safely } from "@/utils/function/safely";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { AxisClosenessBar } from "../SurveyCheckpointAxisCloseness.types";

// The title and the entries of the bar, from the card. The single variant has
// one entry, on the start cap, and is titled with its name. The double
// variant keeps the sides as the quiz has them - the card never swaps them -
// and is titled with the name of the side that leads. Nothing when the name
// the title needs is missing or blank, or when the card cannot be read: such
// a card is not drawn.
export const getAxisClosenessBar = (
  card: AxisClosenessCheckpointCard,
): AxisClosenessBar | undefined =>
  safely(() => {
    const bar =
      card.variant === "single"
        ? { start: card.entry }
        : { start: card.start, end: card.end };
    const leading =
      card.variant === "double" && card.leadingSide === "end"
        ? card.end
        : bar.start;
    const title = toSingleLine(leading.orientation.name);

    return title === "" ? undefined : { title, ...bar };
  }, undefined);
