import { NextApiRequest, NextApiResponse } from "next";
import { SessionData } from "@/types/auth";
import { z } from "zod";
import { post } from "@/helpers/api";
import {
  apiErrorHandler,
  protectedApiRoute,
  setTermsVersion,
} from "@/helpers/server-side";
import { REGISTER_USER } from "@/endpoints";
import Cookies from "cookies";

const updateSchema = z.object({ terms_version: z.number().int().positive() });

async function updateTermsVersion(
  req: NextApiRequest,
  res: NextApiResponse,
  session: SessionData
) {
  const login = session.user.login;
  const { terms_version } = updateSchema.parse(req.body);

  const [data] = await post<{ data: { terms_version: number } }>(
    REGISTER_USER,
    { login, terms_version }
  );
  setTermsVersion(new Cookies(req, res), terms_version);
  res.json(data.data);
}

export default apiErrorHandler(protectedApiRoute(updateTermsVersion));
