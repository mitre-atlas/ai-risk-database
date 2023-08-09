import { NextApiRequest, NextApiResponse } from "next";
import { post } from "@/helpers/api";
import { reportFormSchema } from "@/types/reportFormSchema";
import { apiErrorHandler, protectedApiRoute } from "@/helpers/server-side";
import { Session } from "next-auth";

async function submitReport(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  const user_id = session.user.id;
  const report = { ...req.body, user_id, purls: [req.body.url] };
  const parsedReport = reportFormSchema.parse(report);

  const [data] = await post("/submit_report", parsedReport);
  res.json(data);
}

export default apiErrorHandler(protectedApiRoute(submitReport));
