import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { VOTE_REPORT } from "@/endpoints";
import { post } from "@/helpers/api";
import { apiErrorHandler, protectedApiRoute } from "@/helpers/server-side";
import { Session } from "next-auth";

const voteSchema = z.object({
  state: z.string(),
  report_id: z.string(),
  user_id: z.string(),
});

async function vote(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const user_id = session.user.id;
  const body = voteSchema.parse({ ...req.body, user_id });

  const [data] = await post(VOTE_REPORT, body);
  res.json(data);
}

export default apiErrorHandler(protectedApiRoute(vote));
