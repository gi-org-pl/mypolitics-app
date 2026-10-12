interface PressEvent {
  target: EventTarget | null;
}

// Whether a press caught on a container landed on one of its buttons, and not
// on the space between them.
export const isButtonPress = ({ target }: PressEvent): boolean =>
  target instanceof Element && target.closest("button") !== null;
