import { useLingui } from "@lingui/react/macro";

import type { ModuleDrawingProps } from "./ModuleDrawing.types";
import { ModuleInfoDialog } from "./ModuleInfoDialog/ModuleInfoDialog";
import { getModuleView } from "./utils/getModuleView";
import { useModuleInfo } from "./utils/useModuleInfo";

// One module of a result: the component of its type, given what the module
// was resolved to. A record with a description gives the card its info
// action, which opens the explanation; no module offers statistics, since
// there is no source of them. With a comparison the component is handed the
// other side as well.
export const ModuleDrawing = ({ module, comparison }: ModuleDrawingProps) => {
  const { t } = useLingui();
  const info = useModuleInfo(module.description);
  const { Component, props } = getModuleView(
    module,
    { verifiedLabel: t`Zweryfikowany` },
    comparison,
  );

  return (
    <>
      <Component {...props} onInfoClick={info.open} />
      {info.open && (
        <ModuleInfoDialog
          title={module.title}
          description={module.description}
          isOpen={info.isOpen}
          onClose={info.close}
        />
      )}
    </>
  );
};
