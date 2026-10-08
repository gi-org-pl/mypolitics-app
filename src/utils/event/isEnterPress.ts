interface KeyPress {
  key: string;
  nativeEvent: { isComposing: boolean };
}

// Whether a key press is Enter as a confirmation. Enter that only ends a
// composition - a letter being put together by an input method - is not one.
export const isEnterPress = ({ key, nativeEvent }: KeyPress): boolean =>
  key === "Enter" && !nativeEvent.isComposing;
