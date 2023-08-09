import classNames from "classnames";

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/**
 * Box Section Title
 */
export const SectionTitle = ({
  children,
  className = "",
  ...otherProps
}: Props) => (
  <h3
    className={classNames(
      className,
      "box-title pb-6 text-[1.375rem] leading-6 font-haffer"
    )}
    {...otherProps}
  >
    {children}
  </h3>
);
