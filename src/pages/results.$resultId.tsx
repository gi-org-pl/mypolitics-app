import { type MetaDescriptor, useParams } from "react-router";

import { ResultsScreen } from "@/components/results/ResultsScreen/ResultsScreen";

// The identifier of a result is a key: whoever has the address can read the
// result. So the address is never to be indexed by a search engine.
export const meta = (): MetaDescriptor[] => [
  { name: "robots", content: "noindex" },
];

// The address a result is read at: /results/:resultId. The identifier says
// which result, and it goes nowhere but to the API.
//
// The spacing around the screen is the page's, and so is its width: one
// centred sheet, never wider than the two columns of the design need.
export default function ResultsPage() {
  const { resultId = "" } = useParams();

  return (
    <div className="mx-auto box-content max-w-178 px-4 pt-4 pb-8 md:pt-8 md:pb-24">
      <ResultsScreen resultId={resultId} />
    </div>
  );
}
