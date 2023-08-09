import classNames from "classnames";
import { OptionButton } from "../OptionButton";
import { ReactComponent as FilterIcon } from "public/images/icons/filter.svg";

export const FilterButton = ({
  enabled,
  onClick,
  className,
}: {
  enabled: boolean;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <OptionButton
      label="Filter"
      className={classNames({ "text-brand-blue": enabled }, className)}
      onClick={onClick}
      icon={<FilterIcon className="w-6 h-6 mr-2 inline-block" />}
    />
  );
};

type FilterOptionButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  open: boolean;
};

const defaultClasses =
  "font-roboto py-2 px-3 rounded-full text-sm leading-6 text-primary w-fit h-fit m-0 bg-white disabled:bg-light-gray disabled:cursor-not-allowed hover:text-white hover:bg-primary active:bg-primary active:text-white active:outline-4 active:outline active:outline-transparent-gray";

export const FilterOptionButton = ({
  open,
  className,
  onClick,
  children,
}: FilterOptionButtonProps) => {
  const classes = classNames(
    { "!bg-primary": open, "!text-white": open },
    defaultClasses,
    className
  );
  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
};
