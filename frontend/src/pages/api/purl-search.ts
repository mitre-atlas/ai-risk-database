import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { SEARCH, TOP_MODELS } from "@/endpoints";
import { schema } from "@/helpers/api";
import { apiErrorHandler } from "@/helpers/server-side";

const querySchema = z.string().default("").catch("");

const resultsSchema = z.object({ purl: z.string() }).array();
const searchResultsSchema = z.object({
  results: resultsSchema,
});

async function purlSearch(req: NextApiRequest, res: NextApiResponse) {
  const searchQuery = querySchema.parse(req.query.q);

  if (!searchQuery) {
    const [data] = await schema(resultsSchema).get(TOP_MODELS);
    return res.json(data);
  }

  const [data] = await schema(searchResultsSchema).get(SEARCH, {
    q: searchQuery,
    items: "10",
  });

  res.json(data.results);
}

export default apiErrorHandler(purlSearch);
