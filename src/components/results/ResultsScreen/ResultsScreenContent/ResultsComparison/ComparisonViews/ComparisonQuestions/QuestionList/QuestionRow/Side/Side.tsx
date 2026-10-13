import { OrientationAvatar } from "@/components/results/OrientationAvatar/OrientationAvatar";
import { toSingleLine } from "@/utils/text/toSingleLine";

import { Answer } from "./Answer/Answer";
import type { SideProps } from "./Side.types";

// One side of an opened question: who it is - its mark and its name - and
// under that what it chose, one answer under another. A side that chose
// nothing says so. It is a group named by the side, so each answer is read
// out as that side's.
//
// It stands on two rows of the grid it is put in - the name, then the
// answers - so that two sides drawn next to each other keep their answers on
// one line, however long a name is. The side of the taker is drawn from the
// end: the name before the mark, the text from the right. The name of the
// other side takes the room the row gives it, which may reach past the side:
// with no row around it, the room is the width of the side.
export const Side = ({ who, answers, isTaker = false }: SideProps) => {
  const name = toSingleLine(who.name);

  return (
    <div
      role="group"
      aria-label={name}
      className="row-span-2 grid min-w-0 grid-cols-1 grid-rows-subgrid gap-y-4"
    >
      <div
        className={`flex min-w-0 items-center gap-2 ${isTaker ? "flex-row-reverse text-right" : "w-max max-w-(--side-name-room,100%)"}`}
      >
        <OrientationAvatar
          imageUrl={who.imageUrl}
          color={who.color}
          size="regular"
        />
        <span className="min-w-0 text-base leading-[1.2] font-bold wrap-break-word text-gi-primary">
          {name}
        </span>
      </div>
      <ul className="flex min-w-0 flex-col gap-2">
        {answers.map(({ id, text, agreement }) => (
          <li key={id} className="flex min-w-0">
            <Answer text={text} agreement={agreement} isTaker={isTaker} />
          </li>
        ))}
        {answers.length === 0 && (
          <li className="flex min-w-0">
            <Answer isTaker={isTaker} />
          </li>
        )}
      </ul>
    </div>
  );
};
