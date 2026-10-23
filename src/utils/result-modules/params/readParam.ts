import type {
  ResultModuleParamDefinition,
  ResultModuleParamKind,
  ResultModuleParamReader,
  ResultModuleParamValue,
} from "@/types/results";

import { readChoiceParam } from "./readChoiceParam";
import { readNumberParam } from "./readNumberParam";

// The reader of every kind of definition.
const PARAM_READERS: {
  [Kind in ResultModuleParamKind]: ResultModuleParamReader<Kind>;
} = {
  choice: readChoiceParam,
  number: readNumberParam,
};

// A saved value as its definition reads it: with the reader of the
// definition's kind. No parameter is read by its name.
export const readParam = <Kind extends ResultModuleParamKind>(
  definition: ResultModuleParamDefinition<Kind>,
  value?: ResultModuleParamValue,
) => PARAM_READERS[definition.kind](definition, value);
