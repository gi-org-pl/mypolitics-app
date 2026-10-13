import { useEffect } from "react";

// Sets the title of the document for as long as the component is there and
// has a title to give; the title the document had comes back afterwards.
// Without a title the document keeps its own.
export const useDocumentTitle = (title?: string): void => {
  useEffect(() => {
    if (title === undefined) return;

    const previousTitle = document.title;

    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
