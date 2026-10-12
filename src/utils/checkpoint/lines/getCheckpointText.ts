import type { I18n } from "@lingui/core";

import { CHECKPOINT_POOLS } from "@/constants/checkpoint";
import type {
  CheckpointCard,
  CheckpointLine,
  CheckpointText,
} from "@/types/checkpoint";
import { getCheckpointSlots } from "@/utils/checkpoint/slots/getCheckpointSlots";
import { safely } from "@/utils/function/safely";
import { isCheckpointLine } from "./isCheckpointLine";

// The lead-in and the statement of a line of the card in the active language,
// its slots filled: the card's own line, or the reveal line a puzzle hands
// in. A line is a place in a pool, so the same line comes back in another
// language when the language changes. A value is put in as plain text and is
// never read as part of the line. Nothing when the line does not exist or its
// slots cannot be filled.
export const getCheckpointText = (
  i18n: I18n,
  card: CheckpointCard,
  line: CheckpointLine = card.line,
): CheckpointText | undefined =>
  safely(() => {
    const slots = isCheckpointLine(line)
      ? getCheckpointSlots(card, line.pool)
      : undefined;

    if (!slots) return undefined;

    const { leadIn, statement } = CHECKPOINT_POOLS[line.pool][line.index];

    return {
      leadIn: i18n._(leadIn),
      statement: i18n._(statement.id, slots, { message: statement.message }),
    };
  }, undefined);
