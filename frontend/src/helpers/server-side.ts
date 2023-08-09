import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession } from "next-auth/next";
import Cookies from "cookies";
import jwt from "jsonwebtoken";
import { settings } from "@/pages/api/auth/[...nextauth]";
import { Session, SessionData } from "@/types/auth";
import { logError } from "./error-logging";

// get props that are common to multiple pages
export const getCommonProps = async (context: GetServerSidePropsContext) => {
  const props = {
    modelURL: context.query.modelURL || "",
  };

  return props;
};

export const getSession = (
  req: GetServerSidePropsContext["req"] | NextApiRequest,
  res: GetServerSidePropsContext["res"] | NextApiResponse
): Promise<Session> => {
  return getServerSession(req, res, settings);
};

type ProtectedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: SessionData
) => Promise<void> | void;

export const protectedApiRoute = (handler: ProtectedHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session) {
      res.status(401).json({ message: "You must be logged in." });
      return;
    }

    await handler(req, res, session);
  };
};

/**
 * A wrapper to handle errors on getServerSideProps
 * @param requestHandler getServerSideProps handler function
 * @returns a getServerSideProps handler function which handles known errors
 */
export const pageErrorHandler = <
  Output,
  Input extends GetServerSidePropsContext
>(
  requestHandler: (ctx: Input) => Promise<Output>
) => {
  return async (ctx: Input) => {
    try {
      return await requestHandler(ctx);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { notFound: true };
      }

      logError(error);
      throw error;
    }
  };
};

export const getCookies = ({ req, res }: GetServerSidePropsContext) => {
  return new Cookies(req, res);
};

const TERMS_VERSION_KEY = "terms_version";

export const setTermsVersion = (cookies: Cookies, termsVersion: number) => {
  if (process.env.JWT_PRIVATE_SECRET) {
    const token = jwt.sign(
      termsVersion.toString(),
      process.env.JWT_PRIVATE_SECRET
    );
    cookies.set(TERMS_VERSION_KEY, token);
    return;
  }

  throw new Error("JWT_PRIVATE_SECRET is not defined.");
};

export const getTermsVersion = (cookies: Cookies) => {
  const token = cookies.get(TERMS_VERSION_KEY);
  if (!token) return null;

  if (process.env.JWT_PRIVATE_SECRET) {
    const payload = jwt
      .verify(token, process.env.JWT_PRIVATE_SECRET)
      .toString();
    return parseInt(payload, 10);
  }

  throw new Error("JWT_PRIVATE_SECRET is not defined.");
};

export const apiErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      logError(error);
      throw error;
    }
  };
};
