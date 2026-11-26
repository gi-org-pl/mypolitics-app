import { RESULT_MODULE_COLUMNS } from "@/constants/results";

import { ResultsColumn } from "./ResultsColumn/ResultsColumn";
import type { ResultsColumnsProps } from "./ResultsColumns.types";

// The modules of a result, laid out by CSS alone - nothing is measured.
//
// A narrow sheet has one column: every module, by position. From the width
// two columns of the design fit in (44rem of sheet), each column stands by
// itself, as tall as its own modules, and the two are of equal width. A
// column with no module is not there, so a quiz whose modules all name the
// same column is one column at any width.
export const ResultsColumns = ({ modules }: ResultsColumnsProps) => (
  <div className="flex w-full min-w-0 flex-col gap-4 @[44rem]:grid @[44rem]:auto-cols-fr @[44rem]:grid-flow-col @[44rem]:items-start @[44rem]:gap-6">
    {RESULT_MODULE_COLUMNS.map((column) => (
      <ResultsColumn key={column} column={column} modules={modules} />
    ))}
  </div>
);
