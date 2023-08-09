import { z } from "zod";
import {
  modelInfoSchema,
  reportSchema,
  testResultsSchema,
} from "@/types/modelSchema";
import {
  modelsSortOptions,
  reportsSortOptions,
  artifactsSortOptions,
  SortTuple,
} from "@/features/search/components/Sort";

/**
 * .default is for the case of undefined values, .catch is for the case of validation error
 * So this validation never throws, it just fills in with sane defaults
 */
export const searchInputSchema = z.object({
  q: z.string().trim().default("").or(z.literal("")).catch(""),
  p: z.coerce.number().positive().default(1).catch(1),
  t: z
    .enum(["models", "reports", "artifacts"])
    .default("models")
    .catch("models"),
  s: z
    .string()
    .trim()
    .regex(/^\w+\:(asc|desc)$/)
    .optional()
    .default("")
    .catch(""),
  f: z
    .string()
    .trim()
    .regex(
      /^(source|task|owner):\w+-?\w+((,\w+-?\w+)+)?((;(source|task|owner):\w+-?\w+((,\w+-?\w+)+)?)+)?$/
    )
    .optional()
    .default("")
    .catch(""),
});

/**
 * Sorting should be one of the options available. Otherwise, use default sorting.
 **/
export const refinedSearchInputSchema = searchInputSchema.transform(params => {
  const { t, s } = params;
  const predicate = ([_, value]: SortTuple) => value === s;
  const catchParams = { ...params, s: "" };

  if (t === "models") {
    return modelsSortOptions.find(predicate) ? params : catchParams;
  }
  if (t === "reports") {
    return reportsSortOptions.find(predicate) ? params : catchParams;
  }
  if (t === "artifacts") {
    return artifactsSortOptions.find(predicate) ? params : catchParams;
  }

  return catchParams;
});

export type ResultTypes = z.infer<typeof searchInputSchema>["t"];

export const modelResultItemSchema = modelInfoSchema
  .pick({
    purl: true,
    name: true,
    owner: true,
  })
  .extend({
    date: z.string().nullable(),
    reports: z.number(),
    overall: testResultsSchema,
    task: z.string(),
    type: z.string(),
    libraries: z.string().array(),
  });

export const reportResultItemSchema = reportSchema
  .pick({
    report_id: true,
    title: true,
    updated: true,
    models_affected: true,
    domain: true,
  })
  .extend({
    upvoted: z.number(),
    downvoted: z.number(),
    author: z.string(),
    votes: z.number(),
    purls: z.string().array().optional(),
  });

const filterItemSchema = z
  .string()
  .array()
  .transform(values =>
    values.reduce((acc, value) => {
      if (value) acc.push(value);
      return acc;
    }, [] as string[])
  );

export const modelsResultSetSchema = z.object({
  count: z.number(),
  results: modelResultItemSchema.array(),
  filters: z.object({
    owner: filterItemSchema,
    source: filterItemSchema,
    task: filterItemSchema,
  }),
});

export const reportsResultSetSchema = z.object({
  count: z.number(),
  results: reportResultItemSchema.array(),
  filters: z.object({
    author: filterItemSchema,
    type: filterItemSchema,
  }),
});

export const artifactResultItemSchema = z.object({
  name: z.string(),
  count: z.number(),
  rare: z.boolean(),
  purls: z.string().array(),
});

export const artifactsResultSetSchema = z.object({
  count: z.number(),
  results: artifactResultItemSchema.array(),
  filters: z.object({
    rare_only: filterItemSchema,
  }),
});

export const searchResultsSchema = z.union([
  modelsResultSetSchema,
  reportsResultSetSchema,
  artifactsResultSetSchema,
]);

export type ModelsResultSet = z.infer<typeof modelsResultSetSchema>["results"];
export type ReportsResultSet = z.infer<
  typeof reportsResultSetSchema
>["results"];
export type ArtifactsResultSet = z.infer<
  typeof artifactsResultSetSchema
>["results"];
export type SearchResults =
  | ModelsResultSet
  | ReportsResultSet
  | ArtifactsResultSet;

export const topModelsSchema = z
  .object({
    purl: z.string(),
    name: z.string(),
  })
  .array();

export const topUsersSchema = z
  .object({
    login: z.string().or(z.null()),
    count: z.number(),
  })
  .array();

export const topOrgsSchema = z
  .object({
    company: z.string(),
    count: z.number(),
  })
  .array();

export const sideColumnSchema = z.object({
  topModels: topModelsSchema,
  topUsers: topUsersSchema,
  topOrgs: topOrgsSchema,
});

export type SideColumnData = z.infer<typeof sideColumnSchema>;
