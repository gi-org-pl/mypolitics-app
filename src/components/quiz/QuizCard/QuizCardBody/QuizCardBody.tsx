import { withKeys } from "@/utils/array/withKeys";

import {
  BODY_COLLAPSED_CLASS_NAME,
  BODY_OPEN_CLASS_NAME,
  BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME,
  DESCRIPTION_CLASS_NAME,
  HIGHLIGHTED_DESCRIPTION_CLASS_NAME,
} from "./QuizCardBody.constants";
import type { QuizCardBodyProps } from "./QuizCardBody.types";

export const QuizCardBody = ({
  id,
  description,
  tags,
  isOpen,
  isOpenOnWideScreen,
  isHighlighted,
}: QuizCardBodyProps) => {
  const descriptionClassName = `${DESCRIPTION_CLASS_NAME} ${
    isHighlighted ? HIGHLIGHTED_DESCRIPTION_CLASS_NAME : ""
  }`;

  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows,visibility] duration-300 ease-in-out motion-reduce:transition-none ${
        isOpen ? BODY_OPEN_CLASS_NAME : BODY_COLLAPSED_CLASS_NAME
      } ${isOpenOnWideScreen ? BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME : ""}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`flex flex-col gap-2 pt-2 ${
            isHighlighted ? "md:gap-4 md:pt-4" : ""
          }`}
        >
          {typeof description === "string" ? (
            <p className={descriptionClassName}>{description}</p>
          ) : (
            description !== undefined && (
              <div className={descriptionClassName}>{description}</div>
            )
          )}

          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {withKeys(tags, (tag) => tag).map(({ item, key }) => (
                <li
                  key={key}
                  className="flex min-h-10 items-center rounded-full border border-gi-primary/10 px-2.75 py-2 text-base leading-none font-bold tracking-[-0.01em] wrap-anywhere text-gi-primary"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
