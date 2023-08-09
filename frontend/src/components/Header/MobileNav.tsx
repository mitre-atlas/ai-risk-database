import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Link from "next/link";

import { SearchInput } from "@/components/SearchInput/SearchInput";
import Image from "next/image";
import { ReactComponent as SearchIcon } from "public/images/icons/search.svg";
import { ReactComponent as BurgerMenuIcon } from "public/images/icons/burgerMenu.svg";
import { ReactComponent as CloseIcon } from "public/images/icons/close.svg";
import { Button } from "@/components/Button/Button";
import { useRouter } from "next/router";
import { MOBILE_BREAKPOINT } from "@/constants";

type MobileNavProps = {
  modelURLQueryString: string;
  isHome: boolean;
  className?: string;
  onClickSignIn: () => void;
};

export const MobileNav = ({
  modelURLQueryString,
  isHome,
  className,
  onClickSignIn,
}: MobileNavProps) => {
  const widthRef = useRef(0);
  const { pathname } = useRouter();
  const { handleSearch, handleChange, searchInput, handleClear } =
    useGlobalSearch();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    handleMenu(false);
  }, [pathname]);

  useEffect(() => {
    widthRef.current = window.innerWidth;
    const handleWindowResize = () => {
      if (
        window.innerWidth > MOBILE_BREAKPOINT &&
        widthRef.current <= MOBILE_BREAKPOINT
      ) {
        handleMenu(false);
      }

      widthRef.current = window.innerWidth;
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const handleMenu = (openMenu: boolean) => {
    if (openMenu) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = "100%";
      setShowSearchInput(false);
      setShowMenu(true);
      return;
    }

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    setShowMenu(false);
  };

  const handleClickMenu = () => handleMenu(!showMenu);

  return (
    <div className={classNames("flex flex-col w-full gap-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <h2
              className={classNames(
                "h-8 w-auto font-medium flex items-center",
                {
                  "text-white": isHome,
                }
              )}
            >
              AI Risk Database
            </h2>
          </Link>
        </div>
        <div
          className={classNames("flex items-center justify-end gap-4", {
            ["text-white"]: isHome,
            ["text-primary"]: !isHome,
          })}
        >
          {!showMenu && (
            <button
              type="button"
              onClick={() =>
                setShowSearchInput(showSearchInput => !showSearchInput)
              }
            >
              <SearchIcon />
            </button>
          )}

          <div className="cursor-pointer flex" onClick={handleClickMenu}>
            <button type="button" className="mr-2">
              {showMenu ? <CloseIcon /> : <BurgerMenuIcon />}
            </button>

            {user && (
              <div className="relative cursor-pointer">
                <Image
                  src={user.image || ""}
                  width={40}
                  height={40}
                  alt="avatar"
                  className="rounded-full h-10 w-10"
                />
              </div>
            )}
          </div>

          {showMenu && (
            <div
              className={classNames(
                "fixed top-[89px] bottom-0 right-0 left-0 flex flex-col w-screen justify-center",
                { "bg-brand-blue": isHome, "bg-white": !isHome }
              )}
            >
              <div
                className={classNames("flex p-4 w-full justify-center", {
                  ["text-shuttle-gray "]: !isHome,
                })}
              >
                <Link
                  href={`/report-vulnerability${modelURLQueryString}`}
                  className="font-haffer"
                >
                  Report Vulnerability
                </Link>
              </div>
              {user ? (
                <Button
                  variant={isHome ? "white" : "primary"}
                  onClick={() => signOut()}
                  className="self-center mt-5 mb-10"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={onClickSignIn}
                  variant={isHome ? "white" : "primary"}
                  className="self-center mt-5 mb-10"
                >
                  Sign In
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {showSearchInput && (
        <div className="flex w-full">
          <form
            onSubmit={handleSearch}
            className={classNames("flex flex-1 w-full", {
              ["text-white"]: isHome,
            })}
          >
            <SearchInput
              name="search"
              value={searchInput}
              onChange={handleChange}
              onClear={handleClear}
              className={classNames("w-full py-4 border-none py-0", {
                "text-white bg-brand-blue": isHome,
                "text-oslo-gray": !isHome,
              })}
              placeholder="Search by model name or URL, file hash, file artifact, or risk report..."
            />
          </form>
        </div>
      )}
    </div>
  );
};
