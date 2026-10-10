import { useState } from "react";

import { useAfterPress } from "@/utils/event/useAfterPress";
import { isEmailAddress } from "@/utils/text/isEmailAddress";

interface EmailHint {
  isHintShown: boolean;
  showHint: () => void; // the taker is done with the field: it lost focus, or Enter was pressed
}

// When the hint under the e-mail field is shown. It is asked for when the
// taker is done with a text that is not a valid address, and never while they
// type. It goes as soon as the text is valid or the field is empty, and does
// not come back until it is asked for again.
//
// The hint moves everything that stands under the field. A field that loses
// focus to a press - on the checkbox, on the button - gets its hint when that
// press is over, so the press lands where it was aimed.
export const useEmailHint = (address: string): EmailHint => {
  const [isAskedFor, setIsAskedFor] = useState(false);
  const afterPress = useAfterPress();
  const isNeeded = address.trim() !== "" && !isEmailAddress(address);

  if (isAskedFor && !isNeeded) {
    setIsAskedFor(false);
  }

  return {
    isHintShown: isAskedFor && isNeeded,
    showHint: () => {
      if (isNeeded) {
        afterPress(() => setIsAskedFor(true));
      }
    },
  };
};
