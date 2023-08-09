import classNames from "classnames";

type PillProps = {
  children: string;
  className?: string;
};

export const Pill = ({ children, className }: PillProps) => (
  <span
    className={classNames(
      "text-[0.625rem] leading-3 px-3 py-1 bg-orange rounded text-white font-roboto uppercase font-bold",
      className
    )}
  >
    {children}
  </span>
);
