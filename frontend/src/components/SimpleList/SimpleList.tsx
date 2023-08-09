import { ButtonUnstyled } from "@mui/base";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import { Pill } from "@/components/Pill/Pill";
import classNames from "classnames";

type SimpleListProps = {
  items: {
    title: ReactNode;
    indicator: string;
    href?: string;
    isRare?: boolean;
  }[];
  showOnDefault?: number;
};

const Title = ({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) => {
  const baseClasses = "text-sm text-dark";

  if (href)
    return (
      <Link
        href={href}
        className={classNames(
          `${baseClasses} first:hover:underline`,
          className
        )}
      >
        {children}
      </Link>
    );

  return <span className={classNames(baseClasses, className)}>{children}</span>;
};

export const SimpleList = ({ items, showOnDefault = 5 }: SimpleListProps) => {
  const [showAll, setShowAll] = useState(false);

  const handleClick = () => {
    setShowAll(true);
  };

  const itemsToShow = showAll ? items : items.slice(0, showOnDefault);

  return (
    <>
      <div className="flex flex-col">
        {itemsToShow.map(({ title, indicator, href, isRare }) => (
          <div key={indicator} className="flex justify-between w-full py-3">
            <span>
              <Title href={href} className="hover:text-brand-blue">
                {title}
              </Title>
              {isRare && <Pill className="ml-4">Rare Artifacts</Pill>}
            </span>
            <span className="text-sm text-dark opacity-60 min-w-fit">
              {indicator}
            </span>
          </div>
        ))}
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
