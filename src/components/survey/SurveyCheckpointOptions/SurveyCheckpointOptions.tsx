import type { SurveyCheckpointOptionsProps } from "./SurveyCheckpointOptions.types";
import { SurveyCheckpointOptionsRow } from "./SurveyCheckpointOptionsRow/SurveyCheckpointOptionsRow";
import { useFirstSelection } from "./utils/useFirstSelection";

// The rows a puzzle offers for a guess: a group named by the statement they
// answer, with one button per orientation, in the order given. The first row
// that is activated is the choice, and nothing after it counts. The group
// knows nothing about cards or about which row is correct, and it has no look
// for a row that was chosen, right or wrong: the card that shows it takes the
// rows away after the choice.
//
// It is what a puzzle hands to the `options` of the checkpoint frame. With no
// option it draws nothing.
export const SurveyCheckpointOptions = ({
  label,
  options,
  onSelect,
}: SurveyCheckpointOptionsProps) => {
  const select = useFirstSelection(onSelect);

  if (options.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-full min-w-0 flex-col gap-2"
    >
      {options.map((orientation) => (
        <SurveyCheckpointOptionsRow
          key={orientation.id}
          orientation={orientation}
          onSelect={select}
        />
      ))}
    </div>
  );
};
