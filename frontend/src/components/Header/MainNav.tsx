import { useRouter } from "next/router";
import { query as queryString } from "@/helpers/api";
import classNames from "classnames";
import { DesktopNav } from "@/components/Header/DesktopNav";
import { MobileNav } from "@/components/Header/MobileNav";
import { signIn } from "next-auth/react";

const modelURIKeys = ["modelURL", "purl", "q"];

export const MainNav = ({ modelURL }: { modelURL: string }) => {
  const { pathname, query } = useRouter();
  const isHome = pathname === "/";

  const key = modelURIKeys.find(key => query[key]) || "";
  const modelURLValue = modelURL || query[key]?.toString();
  const modelURLQueryString = modelURLValue
    ? queryString({ modelURL: modelURLValue })
    : "";

  const handleSignIn = () => {
    signIn("", {
      callbackUrl: `/auth/verify?redirectURL=${encodeURIComponent(
        document.URL
      )}`,
    });
  };

  return (
    <header
      className={classNames(
        "flex top-0 px-6 py-6 z-40 border-b text-primary relative sm:px-12 lg:px-[7.5rem] 3xl:px-[22.5rem]",
        {
          ["border-white lg:header-gradient bg-brand-blue"]: isHome,
          ["border-athens bg-white"]: !isHome,
        }
      )}
    >
      <DesktopNav
        className="lg:flex hidden w-full"
        modelURLQueryString={modelURLQueryString}
        isHome={isHome}
        onClickSignIn={handleSignIn}
      />
      <MobileNav
        className="lg:hidden flex"
        modelURLQueryString={modelURLQueryString}
        isHome={isHome}
        onClickSignIn={handleSignIn}
      />
    </header>
  );
};
