import { FC, ReactNode } from "react";
import Image from "next/image";

import globeImg from "../../public/images/particleGlobeTop.png";

type PageLayoutProps = {
  children: ReactNode;
  pageTitle: string;
};

export const PageLayout: FC<PageLayoutProps> = ({ children, pageTitle }) => {
  return (
    <>
      <div className="relative mx-6 sm:mx-12 lg:mx-[7.5rem] 3xl:mx-[22.5rem]">
        <Image
          src={globeImg}
          alt="Globe"
          className="lg:block hidden absolute bottom-0 right-0"
          priority
        />
        <h1 className="h1 pt-16 pb-9">{pageTitle}</h1>
      </div>
      <div className="flex flex-1 bg-wild-sand pt-14 pb-40">
        <div className="w-full mx-6 sm:mx-12 lg:mx-[7.5rem] 3xl:mx-[22.5rem]">
          {children}
        </div>
      </div>
    </>
  );
};
