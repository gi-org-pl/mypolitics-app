interface CancellableEvent {
  preventDefault: () => void;
  stopPropagation: () => void;
}

// A handler for a container that takes no input for a moment: used in the
// capture phase, it ends the event before any control inside the container
// hears of it, and the browser does not act on it either.
export const cancelEvent = (event: CancellableEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};
