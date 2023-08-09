import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { get, schema } from "@/helpers/api";
import { GET_FILE_INFO, VALIDATE_SEARCH_QUERY } from "@/endpoints";

const fileInfoSchema = z.object({ sha256: z.string() });

async function proxy(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query?.q as string) || "";

  if (!q) {
    res.status(400);
    res.send("Malformed query");
  }

  try {
    const validateQueryPromise = get(VALIDATE_SEARCH_QUERY, { q: q.trim() });
    const fileInfoPromise = schema(fileInfoSchema).get(GET_FILE_INFO, {
      sha256: q.trim(),
    });

    const [validateQuery, fileInfo] = await Promise.allSettled([
      validateQueryPromise,
      fileInfoPromise,
    ]);

    if (validateQuery.status === "fulfilled") {
      const [data] = validateQuery.value;
      return res.send(data);
    }
    if (fileInfo.status === "fulfilled") {
      const [data] = fileInfo.value;
      return res.send(data);
    }

    if (validateQuery.status === "rejected") {
      throw validateQuery.reason;
    }
    if (fileInfo.status === "rejected") {
      throw fileInfo.reason;
    }
  } catch (error: any) {
    res.status(error.response.status);
    res.json({ message: error.response.statusText });
  }
}

export default proxy;
