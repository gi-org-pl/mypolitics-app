import { ErrorBoundary } from "@/components/shared/ErrorBoundary/ErrorBoundary";

import { ModuleDrawing } from "./ModuleDrawing/ModuleDrawing";
import type { ResultsModuleProps } from "./ResultsModule.types";

// The place of one module among the others. Its order is its place in the
// list of the whole result: that is what sorts the modules of both columns
// into one column on a narrow sheet.
//
// A module that throws while it draws is contained here: it is not drawn, and
// the rest of the screen stays. A place with nothing in it takes no room, so
// the modules below move up.
export const ResultsModule = ({ module, order }: ResultsModuleProps) => (
  <div className="min-w-0 empty:hidden" style={{ order }}>
    <ErrorBoundary>
      <ModuleDrawing module={module} />
    </ErrorBoundary>
  </div>
);
