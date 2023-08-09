import {
  getCookies,
  getSession,
  pageErrorHandler,
  setTermsVersion,
} from "@/helpers/server-side";
import { shouldAcceptTerms } from "@/helpers/user";

export const getServerSideProps = pageErrorHandler(async ctx => {
  const session = await getSession(ctx.req, ctx.res);

  const cookies = getCookies(ctx);
  const termsVersion = session?.user.terms_version || null;

  if (termsVersion && termsVersion > 0) {
    setTermsVersion(cookies, termsVersion);
  }

  const redirectURL = (ctx.query.redirectURL as string) || "/";

  if (shouldAcceptTerms(termsVersion)) {
    return {
      redirect: {
        destination: `/auth/terms-signature?redirectURL=${encodeURIComponent(
          redirectURL
        )}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: redirectURL,
      permanent: false,
    },
  };
});

const Verify = () => {
  return <div></div>;
};

export default Verify;
