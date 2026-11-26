import type { ResultsColumnProps } from "./ResultsColumn.types";
import { ResultsModule } from "./ResultsModule/ResultsModule";
import { getColumnSlots } from "./utils/getColumnSlots";

// One of the two columns: the modules whose record names it, by position.
//
// On a narrow sheet the column is not a box of its own: its modules stand
// straight among the modules of the other column, each at its place in the
// order of the whole list. From the width two columns fit in it is a stack,
// and a stack with nothing in it is not there at all.
export const ResultsColumn = ({ column, modules }: ResultsColumnProps) => (
  <div
    data-column={column}
    className="contents @[44rem]:flex @[44rem]:min-w-0 @[44rem]:flex-col @[44rem]:gap-4 @[44rem]:[&:not(:has(>:not(:empty)))]:hidden"
  >
    {getColumnSlots(modules, column).map(({ module, order }) => (
      <ResultsModule key={module.id} module={module} order={order} />
    ))}
  </div>
);
