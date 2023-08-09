import { FC, ReactNode } from "react";
import Link from "next/link";
import { Tab, Tabs } from "@mui/material";
import classNames from "classnames";
import Image from "next/image";

import globeImg from "../../public/images/particleGlobeTop.png";

type TabLayoutProps = {
  children: ReactNode;
  pageTitle: string;
  tabs: { label: string; href: string; active?: boolean }[];
};

export const TabLayout: FC<TabLayoutProps> = ({
  children,
  pageTitle,
  tabs,
}) => {
  const activeIndex = tabs.findIndex(tab => tab.active);

  return (
    <>
      <div className="lg:px-32 px-0 relative">
        <Image
          src={globeImg}
          alt="Globe"
          className="lg:block hidden absolute bottom-0 right-0"
        />
        <h1 className="h1 pt-16 pb-9 lg:px-0 px-6">{pageTitle}</h1>
        <Tabs
          value={activeIndex}
          sx={{
            "& .MuiTab-root": {
              opacity: "100%",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#0129ff",
            },
          }}
        >
          {tabs.map(({ label, href, active = false }) => (
            <Link href={href} key={label}>
              <Tab
                className={classNames(
                  "font-roboto normal-case text-oslo-gray text-sm font-normal",
                  { "font-medium text-brand-blue": active }
                )}
                label={label}
              />
            </Link>
          ))}
        </Tabs>
      </div>
      <div className="flex flex-1 bg-wild-sand pt-14 pb-40 lg:px-32">
        {children}
      </div>
    </>
  );
};
