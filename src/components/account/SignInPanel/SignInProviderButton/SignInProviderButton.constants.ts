import { FOCUS_CLASS_NAME } from "@/constants/focus";

// White, a hairline dark-ash outline, a 16 px bold label, 48 px high. A
// disabled button keeps its colours and is drawn at 40%.
export const BUTTON_CLASS_NAME = `relative h-12 w-full justify-start gap-3 border-gi-dark-ash bg-white px-5 text-base leading-[1.2] font-bold text-gi-primary hover:border-gi-gray hover:bg-white data-[disabled=true]:border-gi-dark-ash data-[disabled=true]:bg-white data-[disabled=true]:text-gi-primary data-[disabled=true]:opacity-40 ${FOCUS_CLASS_NAME}`;
