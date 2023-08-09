import { z } from "zod";
import { modelInfoSchema, testResultsSchema } from "@/types/modelSchema";

export const modelSchemaRelated = z.object({
  model_info: modelInfoSchema.pick({
    purl: true,
    name: true,
    owner: true,
  }),
});

const scoreStatusSchema = testResultsSchema.pick({ status: true });

const relatedModelItemSchema = z.object({
  name: z.string(),
  purl: z.string(),
  fullname: z.string(),
  task: z.string(),
  match: z.number(),
  security: scoreStatusSchema,
  ethics: scoreStatusSchema,
  performance: scoreStatusSchema,
  owner: z.string(),
});

export type RelatedModel = z.infer<typeof relatedModelItemSchema>;

export const relatedModelsSchema = z.object({
  count: z.number(),
  results: relatedModelItemSchema.array(),
});
