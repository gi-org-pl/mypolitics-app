// Whether a text contains what is searched for, ignoring letter case and the
// space around the search. An empty search is contained in every text; a
// missing text contains only an empty search.
export const containsText = (
  text: string | undefined,
  search: string,
): boolean =>
  (text ?? "").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
