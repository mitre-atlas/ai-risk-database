import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

import riLogo from "public/images/riLogo.png";
import githubIcon from "public/images/githubIcon.png";
import slackIcon from "public/images/slackIcon.png";

export const Footer = () => {
  const { status } = useSession();

  return (
    <footer className="flex top-0 px-6 py-8 z-40 bg-white justify-between flex-col lg:flex-row w-full sm:px-12 lg:px-[7.5rem] 3xl:px-[22.5rem]">
      <div className="flex items-center lg:mb-0 mb-6">
        <span className="text-oslo-gray text-sm pr-6">Powered by</span>
        <Link href="https://www.robustintelligence.com/">
          <Image
            src={riLogo}
            alt="Robust Intelligence logo"
            className="h-8 w-auto"
          />
        </Link>
      </div>
      <div className="flex lg:items-center flex-col lg:flex-row justify-between">
        <div className="flex lg:items-center text-sm text-oslo-gray opacity-60 flex-col lg:flex-row">
          {status === "unauthenticated" && (
            <Link
              href="/"
              className="lg:mx-5 lg:my-0 my-2"
              onClick={e => {
                e.preventDefault();
                signIn();
              }}
            >
              Sign In
            </Link>
          )}
          <Link href="/legal/terms-of-service" className="lg:mx-5 lg:my-0 my-2">
            Terms of Service
          </Link>
          <Link href="/legal/privacy-policy" className="lg:mx-5 lg:my-0 my-2">
            Privacy Policy
          </Link>
        </div>
        <Link
          href="https://github.com/mitre-atlas/ai-risk-database"
          className="m-4"
        >
          <Image src={githubIcon} alt="Github logo" className="h-6 w-auto" />
        </Link>
        <Link
          href="https://join.slack.com/t/mitreatlas/shared_invite/zt-10i6ka9xw-~dc70mXWrlbN9dfFNKyyzQ"
          className="m-4"
        >
          <Image src={slackIcon} alt="Slack logo" className="h-6 w-auto" />
        </Link>
      </div>
    </footer>
  );
};
