import { useEffect, useState } from "react";
import { post } from "@/helpers/api";
import Script from "next/script";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import {
  getCookies,
  getSession,
  getTermsVersion,
  pageErrorHandler,
} from "@/helpers/server-side";
import { useGlobalProgress } from "@/components/GlobalProgress/GlobalProgress";
import { shouldAcceptTerms } from "@/helpers/user";

const accountId = process.env.NEXT_PUBLIC_DOCUSIGN_ACCOUNT_ID;
const clickwrapId = process.env.NEXT_PUBLIC_DOCUSIGN_CLICKWRAP_ID;
const docusignURL = process.env.NEXT_PUBLIC_DOCUSIGN_ENVIRONMENT_URL;

if (!accountId || !clickwrapId || !docusignURL) {
  console.warn(
    "Missing Docusign environment variables. Check NEXT_PUBLIC_DOCUSIGN_ACCOUNT_ID, NEXT_PUBLIC_DOCUSIGN_CLICKWRAP_ID, NEXT_PUBLIC_DOCUSIGN_ENVIRONMENT_URL."
  );
}

export const getServerSideProps = pageErrorHandler(async ctx => {
  const session = await getSession(ctx.req, ctx.res);
  const redirectURL = (ctx.query.redirectURL as string) || "/";

  const termsVersion = getTermsVersion(getCookies(ctx));

  if (!session || !shouldAcceptTerms(termsVersion)) {
    return {
      redirect: {
        destination: redirectURL,
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
      redirectURL,
    },
  };
});

type AgreementData = {
  versionNumber: number;
};

export const TermsAndConditions = ({
  user,
  redirectURL,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { setEnableGlobalProgress } = useGlobalProgress();
  const [status, setStatus] = useState<
    "loading" | "agreed" | "declined" | "already_agreed" | null
  >("loading");

  useEffect(() => {
    setEnableGlobalProgress(true);
  }, [setEnableGlobalProgress]);

  const onDocusignReady = () => {
    let mustAgree = false;

    //@ts-ignore
    window.docuSignClick.Clickwrap.render(
      {
        style: {
          scrollControl: "browser",
          header: { display: "none" },
          agreeButton: {
            borderRadius: "9999px",
            backgroundColor: "#0129ff",
            fontSize: "16px",
            fontFamily: "Haffer, Helvetica, sans-serif",
            padding: "16px 32px 16px 32px",
            margin: "0 24px 0 0",
          },
          container: { borderColor: "#fff" },
        },
        environment: docusignURL,
        accountId,
        clickwrapId,
        clientUserId: user.id,
        documentData: {
          fullName: user.name,
          email: user.email,
          date: format(new Date(), "MM/dd/yyyy"),
        },
        onMustAgree: () => {
          setStatus(null);
          setEnableGlobalProgress(false);
          mustAgree = true; // the user needs to agree
        },
        onAgreed: async (agreementData: AgreementData) => {
          setEnableGlobalProgress(false);

          setStatus(mustAgree ? "agreed" : "already_agreed");
          setEnableGlobalProgress(true);

          await post("/client-api/update-terms-version", {
            terms_version: agreementData.versionNumber,
          });
          router.push(redirectURL);
        },
        onDeclined: () => {
          setStatus("declined");
          setEnableGlobalProgress(false);
          router.push(redirectURL);
        },
        onError: (error: any) => {
          setStatus(null);
          setEnableGlobalProgress(false);
          console.error("ERROR", error);
        },
      },
      "#ds-clickwrap"
    );
  };

  return (
    <>
      <PageTop>
        <h1 className="h1 pt-16 pb-14 lg:px-0 px-6">Terms and Conditions</h1>
      </PageTop>
      <PageContainer>
        {status !== "agreed" && status !== null && (
          <Box className="box">
            {status === "loading" && (
              <p>
                Loading Terms and Conditions agreement from DocuSign&reg;...
              </p>
            )}
            {status === "declined" && (
              <p>You won&apos;t be able to submit reports or vote reports.</p>
            )}
            {status === "already_agreed" && <p>Already agreed.</p>}
          </Box>
        )}
        <div id="ds-clickwrap" />
        <Script
          onReady={onDocusignReady}
          src={`${docusignURL}/clickapi/sdk/latest/docusign-click.js`}
        ></Script>
      </PageContainer>
    </>
  );
};

export default TermsAndConditions;
