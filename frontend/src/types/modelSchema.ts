import { z } from "zod";

export enum RiskStatus {
  NotTested = "not_tested",
  Severe = "severe",
  Warning = "warning",
  Pass = "pass",
}

export const testResultsSchema = z.object({
  total: z.number(),
  pass: z.number(),
  status: z.nativeEnum(RiskStatus),
  rank: z.number(),
});

export type Score = z.infer<typeof testResultsSchema>;

const riskOverviewSchema = z.object({
  security: testResultsSchema,
  ethics: testResultsSchema,
  performance: testResultsSchema,
  overall: testResultsSchema,
});

export const modelInfoSchema = z.object({
  purl: z.string(),
  basepurl: z.string(),
  name: z.string(),
  owner: z.string(),
  commithash: z.string(),
  commitdate: z.string(),
  repo_uri: z.string(),
  commit_uri: z.string(),
  reports: z.string().array(),
  scans: z.string().array(),
  vulnerabilities: z.string().array(),
  updated: z.string(),
});

const repoSchema = z.object({
  basepurl: z.string(),
  uri: z.string(),
  type: z.string(),
  name: z.string(),
  fullname: z.string(),
  owner: z.string(),
  // Note that this object can hold any data so passthrough() used to keep extra keys
  reputation: z.object({ likes: z.number().optional(), downloads: z.number().optional() }).passthrough(),
  repo_info: z.object({
    tags: z.string().array().optional(),
    carddata: z
      .object({
        datasets: z.string().array().optional(),
        license: z.string().optional().or(z.string().array()),
        metrics: z.string().array().optional(),
        "model-index": z.any().array().optional(),
        tags: z.string().array().optional(),
      })
      .optional(),
  }),
  versions: z.record(z.string(), z.string()),
  task: z.string(),
  libraries: z.string().array(),
  created: z.string(),
  commitdate: z.string(),
  commithash: z.string(),
});

const sbomSchema = z.object({
  purl: z.string(),
  files: z
    .object({
      filename: z.string(),
      sha256: z.string(),
      orderedSha256: z.string().optional(),
      size: z.string(),
      rare: z.string().array().optional(),
    })
    .array()
    .optional(),
});

export const reportSchema = z.object({
  report_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  updated: z.string(),
  models_affected: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  author_info: z.any(),
  vulnerabilities: z.string().array(),
  domain: z.string(),
});

export const reportsSchema = reportSchema.array().optional();

export const modelOverviewSchema = z.object({
  repos: repoSchema,
  risk_overview: riskOverviewSchema,
  model_info: modelInfoSchema,
  sbom: sbomSchema,
  reports: reportsSchema,
});
