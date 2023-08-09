import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";
import { ButtonUnstyled } from "@mui/base";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { ReactComponent as ChevronIcon } from "public/images/icons/chevron.svg";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

type DesktopNavProps = {
  modelURLQueryString: string;
  isHome: boolean;
  className?: string;
  onClickSignIn: () => void;
};

export const DesktopNav = ({
  modelURLQueryString,
  isHome,
  className,
  onClickSignIn,
}: DesktopNavProps) => {
  const { handleSearch, handleChange, searchInput, handleClear } =
    useGlobalSearch();
  const { data: session } = useSession();
  const showSearchInput = !isHome;
  const user = session?.user;

  const [signOutAnchor, setSignOutAnchor] = useState<null | HTMLElement>(null);
  const signOutOpen = !!signOutAnchor;
  const handleSignOutClose = () => {
    setSignOutAnchor(null);
  };

  return (
    <div className={className}>
      <div className="flex items-center flex-1">
        <Link href="/" className="flex items-center">
          <h2
            className={classNames("text-2xl font-medium whitespace-nowrap", {
              "text-white": isHome,
            })}
          >
            AI Risk Database
          </h2>
        </Link>
        {showSearchInput && (
          <form onSubmit={handleSearch} className="flex w-full mx-10">
            <SearchInput
              name="search"
              value={searchInput}
              onChange={handleChange}
              onClear={handleClear}
              className="w-full text-oslo-gray py-4"
              placeholder="Search by model name or URL, file hash, file artifact, or risk report..."
            />
          </form>
        )}
      </div>
      <div
        className={classNames(
          "flex items-center text-sm font-haffer lg:justify-end justify-between lg:w-auto w-full !text-base",
          { ["text-white"]: isHome, ["text-primary"]: !isHome }
        )}
      >
        <Link
          href={`/report-vulnerability${modelURLQueryString}`}
          className="mx-2 lg:mx-5"
        >
          Report Vulnerability
        </Link>
        {!user ? (
          <ButtonUnstyled
            type="button"
            onClick={onClickSignIn}
            className={classNames(
              "primary-button ml-2 lg:ml-5 whitespace-nowrap text-base",
              { "transparent-white-button": isHome }
            )}
          >
            Sign In
          </ButtonUnstyled>
        ) : (
          <div className="relative ml-2 lg:ml-5">
            <ButtonUnstyled
              type="button"
              onClick={event => setSignOutAnchor(event.currentTarget)}
              className="flex items-center"
            >
              <Image
                src={user.image || ""}
                width={50}
                height={50}
                alt="avatar"
                className="rounded-full h-12 w-12"
              />
              <span className="ml-2 text-base">{user.name}</span>
              <ChevronIcon className="ml-3" />
            </ButtonUnstyled>
            <Menu
              className="mt-2"
              open={signOutOpen}
              anchorEl={signOutAnchor}
              onClose={handleSignOutClose}
              anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
              transformOrigin={{ horizontal: "center", vertical: "top" }}
            >
              <MenuItem
                className="p-2 px-8 border border-athens text-primary w-full"
                onClick={() => signOut()}
              >
                Sign Out
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>
    </div>
  );
};
