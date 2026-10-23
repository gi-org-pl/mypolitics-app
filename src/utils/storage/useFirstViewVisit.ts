import { useEffect, useRef, useState } from "react";

import { claimFirstViewVisit } from "./claimFirstViewVisit";

type ViewVisit = {
  routeId: string;
  isFirst: boolean;
};

// Whether the view of a route is open for the first time in this tab's
// session. The answer is no on the first render, before the scripts can read
// the storage, and for no route at all; after mount the visit is noted and
// the answer is yes when nothing had noted it before. A change of route is
// answered anew, and until then the answer for the new route is no.
//
// A route is noted once, and again only after another route (or none) came
// in between: an effect that runs twice for the same route, as it does in
// strict mode, would find its own note and call the visit a later one.
export const useFirstViewVisit = (routeId?: string): boolean => {
  const [visit, setVisit] = useState<ViewVisit>();
  const notedRouteIdRef = useRef<string>(undefined);

  useEffect(() => {
    if (notedRouteIdRef.current === routeId) return;

    notedRouteIdRef.current = routeId;

    if (routeId === undefined) return;

    setVisit({ routeId, isFirst: claimFirstViewVisit(routeId) });
  }, [routeId]);

  return visit !== undefined && visit.routeId === routeId && visit.isFirst;
};
