import { z } from "zod";

const id = z.string().min(1);

// Only what the app reads of a project. Both fields are always sent: `id` is
// what tells a project from any other reply, and `latestSurveyId` is null
// while the project has no survey to take.
export const projectResponseSchema = z.object({
  id,
  latestSurveyId: id.nullable(),
});
