interface PropagatingEvent {
  stopPropagation: () => void;
}

// A handler for a control that sits inside a clickable container: the click
// is handled by the control and does not reach the container.
export const withoutPropagation =
  (handler: () => void) =>
  (event: PropagatingEvent): void => {
    event.stopPropagation();
    handler();
  };
