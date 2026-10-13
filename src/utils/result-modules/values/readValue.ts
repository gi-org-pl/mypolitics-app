import type {
  ResultModuleValue,
  ResultModuleValueDefinition,
  ResultModuleValueKind,
  ResultModuleValueReader,
} from "@/types/results";

import { readBooleanValue } from "./readBooleanValue";
import { readChoiceValue } from "./readChoiceValue";
import { readColorValue } from "./readColorValue";
import { readNumberValue } from "./readNumberValue";
import { readTextValue } from "./readTextValue";

// The reader of every kind of definition. A text per language is read like a
// text: the API sends it in one language.
const VALUE_READERS: {
  [Kind in ResultModuleValueKind]: ResultModuleValueReader<Kind>;
} = {
  text: readTextValue,
  localizedText: readTextValue,
  number: readNumberValue,
  choice: readChoiceValue,
  boolean: readBooleanValue,
  color: readColorValue,
};

// A saved value as its definition reads it: with the reader of the
// definition's kind. No value is read by its key.
export const readValue = <Kind extends ResultModuleValueKind>(
  definition: ResultModuleValueDefinition<Kind>,
  value?: ResultModuleValue,
) => VALUE_READERS[definition.kind](definition, value);
