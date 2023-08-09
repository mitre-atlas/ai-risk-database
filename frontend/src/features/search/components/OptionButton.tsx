import classNames from "classnames";

type OptionButtonProps = {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const OptionButton = ({
  icon,
  label,
  className,
  onClick,
}: OptionButtonProps) => {
  const classes = classNames(
    "p-2 py-1 bg-white border border-white text-sm leading-6 rounded hover:border hover:border-light-gray outline-none",
    className
  );

  return (
    <button onClick={onClick} className={classes}>
      {icon} {label}
    </button>
  );
};
