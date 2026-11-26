import { useLingui } from "@lingui/react/macro";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getResult } from "@/services/api/client/getResult";
import type { ComparisonMode } from "@/types/comparison";
import { getOfferedOrientations } from "@/utils/comparison/getOfferedOrientations";

import { INITIAL_COMPARISON_STATE } from "../ResultsComparison.constants";
import {
  type ComparisonContext,
  type ComparisonState,
  ComparisonStatus,
  type ComparisonView,
  type ResultsComparisonControls,
} from "../ResultsComparison.types";
import { chooseComparisonMode } from "./chooseComparisonMode";
import { chooseComparisonView } from "./chooseComparisonView";
import { endComparison } from "./endComparison";
import { enterFriendId } from "./enterFriendId";
import { pickComparisonOrientation } from "./pickComparisonOrientation";
import { receiveFriendResult } from "./receiveFriendResult";

// The comparison of one result: which state of the spec's table it is in, and
// what the taker can do. One other side at a time; starting a comparison is
// only possible once the one before it has ended.
//
// The state lives here and nowhere else: nothing about the other side is
// stored or put in the address, so it lasts as long as the open page. The
// result of a friend is asked for once per identifier entered, and a read
// that is left - the tab is closed, the screen goes - is cancelled.
export const useResultsComparison = ({
  survey,
  result,
  resolved,
}: ComparisonContext): ResultsComparisonControls => {
  const { t } = useLingui();
  const [state, setState] = useState<ComparisonState>(INITIAL_COMPARISON_STATE);
  const orientations = useMemo(() => getOfferedOrientations(survey), [survey]);
  const context = useMemo(
    () => ({ survey, result, resolved }),
    [survey, result, resolved],
  );
  const friendName = t`Znajomy`;
  const requestedId =
    state.status === ComparisonStatus.Fetching ? state.requestedId : undefined;

  useEffect(() => {
    if (requestedId === undefined) return;

    const controller = new AbortController();

    getResult(requestedId, { signal: controller.signal }).then((load) => {
      if (!controller.signal.aborted) {
        setState((current) =>
          receiveFriendResult(current, requestedId, load, context, friendName),
        );
      }
    });

    return () => controller.abort();
  }, [requestedId, context, friendName]);

  const chooseMode = useCallback(
    (mode: ComparisonMode) =>
      setState((current) => chooseComparisonMode(current, mode)),
    [],
  );
  const enterId = useCallback(
    (text: string) =>
      setState((current) => enterFriendId(current, text, result.id)),
    [result.id],
  );
  const pickOrientation = useCallback(
    (orientationId: string) =>
      setState((current) =>
        pickComparisonOrientation(
          current,
          orientationId,
          orientations,
          context,
        ),
      ),
    [orientations, context],
  );
  const chooseView = useCallback(
    (view: ComparisonView) =>
      setState((current) => chooseComparisonView(current, view)),
    [],
  );
  const end = useCallback(() => setState(endComparison), []);

  return {
    state,
    orientations,
    chooseMode,
    enterFriendId: enterId,
    pickOrientation,
    chooseView,
    end,
  };
};
