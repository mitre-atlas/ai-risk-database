import { FC, ReactNode } from "react";
import Image from "next/image";

import globeImg from "../../../public/images/particleGlobeTop.png";

type PageTopProps = {
  children: ReactNode;
};

export const PageTop: FC<PageTopProps> = ({ children }) => {
  return (
    <div className="px-0 relative mx-6 sm:mx-12 lg:mx-[7.5rem] 3xl:mx-[22.5rem]">
      <Image
        src={globeImg}
        alt="Globe"
        className="lg:block hidden absolute bottom-0 right-0 z-[-100]"
      />
      {children}
    </div>
  );
};
