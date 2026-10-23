import { useState } from "react";
import { ResultsColumns } from "../../ResultsColumns/ResultsColumns";
import { ResultsHeader } from "../../ResultsHeader/ResultsHeader";
import type { ResultsTab } from "../../ResultsHeader/ResultsHeader.types";
import { ResultsComparison } from "./ResultsComparison/ResultsComparison";
import { ResultsPanel } from "./ResultsPanel/ResultsPanel";
import { ResultsQuizName } from "./ResultsQuizName/ResultsQuizName";
import type { ResultsScreenContentProps } from "./ResultsScreenContent.types";

// A result as it is read: one sheet with the header and its two tabs on top,
// the content of the active tab under them, and the name of the quiz at the
// bottom. A quiz with no header record has no tabs, and shows its modules.
//
// The modules stay in the page while the other tab is shown, so a list that
// was unfolded is still unfolded when the taker comes back to it. The same
// holds for the comparison: one that runs is still running when the taker
// goes to their results and back.
//
// The sheet is a container: what is inside follows the width of the sheet,
// whatever the page around it does. Its outline is drawn over its content,
// as in the design, so it takes none of the width.
export const ResultsScreenContent = ({
  survey,
  result,
  resolved,
}: ResultsScreenContentProps) => {
  const [activeTab, setActiveTab] = useState<ResultsTab>("results");
  const hasTabs = resolved.header !== undefined;

  return (
    <div className="@container relative w-full min-w-0 overflow-hidden rounded-4xl bg-white after:pointer-events-none after:absolute after:inset-0 after:rounded-4xl after:border after:border-gi-dark-ash after:content-['']">
      {resolved.header && (
        <ResultsHeader
          {...resolved.header}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      <ResultsPanel
        tab="results"
        isActive={activeTab === "results"}
        hasTabs={hasTabs}
      >
        <ResultsColumns modules={resolved.modules} />
      </ResultsPanel>
      <ResultsPanel
        tab="comparison"
        isActive={activeTab === "comparison"}
        hasTabs={hasTabs}
      >
        <ResultsComparison
          survey={survey}
          result={result}
          resolved={resolved}
        />
      </ResultsPanel>
      <ResultsQuizName name={survey.name} />
    </div>
  );
};
