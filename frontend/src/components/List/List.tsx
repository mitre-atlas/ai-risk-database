import Image from "next/image";
import Link from "next/link";
import { ButtonUnstyled } from "@mui/base";
import { ReactNode, useEffect, useRef, useState } from "react";

import cubeIcon from "../../../public/images/icons/cube.svg";
import warningIcon from "../../../public/images/icons/warning.svg";
import classNames from "classnames";

export type ListItem = {
  title: string;
  description: string;
  indicators: ReactNode[];
  icon: "warning" | "cube";
  href?: string;
};

type List = { items: ListItem[]; showOnDefault?: number };

export const List = ({ items, showOnDefault = 5 }: List) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const itemsToShow = showAll ? items : items.slice(0, showOnDefault);

  const getIcon = (icon: ListItem["icon"]) => {
    if (icon === "warning") return warningIcon;
    if (icon === "cube") return cubeIcon;
  };

  useEffect(() => {
    setHeight(listRef.current?.offsetHeight ?? 0);
  }, [showAll]);

  const handleClick = () => {
    setShowAll(true);
  };

  return (
    <>
      <div
        className={classNames("overflow-hidden", {
          ["transition-all"]: showAll,
        })}
        style={{
          height: `${height}px`,
          minHeight: `${height}px`,
          maxHeight: `${height}px`,
        }}
      >
        <div className="flex flex-col" ref={listRef}>
          {itemsToShow.map(
            ({ title, icon, indicators, description, href }, index) => (
              <div
                key={index}
                className="lg:grid lg:grid-cols-list-item-columns flex py-4 border-b border-mercury w-full justify-between items-start last:border-0 flex-col"
              >
                <div className="flex lg:items-center items-start">
                  <Image
                    src={getIcon(icon)}
                    alt={icon}
                    width={56}
                    height={56}
                  />
                  <div className="flex px-3 flex-col w-full overflow-hidden">
                    <Link
                      href={href || ""}
                      className="overflow-hidden whitespace-nowrap text-ellipsis hover:text-brand-blue"
                    >
                      <span className="text-sm">{title}</span>
                    </Link>
                    <span className="text-sm opacity-60">{description}</span>
                    <div className="lg:hidden flex flex-col text-sm text-oslo-gray w-full overflow-hidden">
                      {indicators.map((indicator, index) => (
                        <span
                          className="overflow-hidden whitespace-nowrap text-ellipsis"
                          key={index}
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex flex-col text-sm text-oslo-gray text-right w-full overflow-hidden self-center">
                  {indicators.map((indicator, index) => (
                    <span
                      className="overflow-hidden whitespace-nowrap text-ellipsis"
                      key={index}
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
      {items.length > itemsToShow.length && (
        <div className="flex justify-center mt-2">
          <ButtonUnstyled
            type="button"
            className="primary-button"
            onClick={handleClick}
          >
            View All
          </ButtonUnstyled>
        </div>
      )}
    </>
  );
};
