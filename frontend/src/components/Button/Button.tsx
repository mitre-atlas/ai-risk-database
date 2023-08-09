import classnames from "classnames";

type Variants = "blue" | "primary" | "white";

const buttonStyles: Record<Variants, string> = {
  blue: "blue-button",
  primary: "primary-button",
  white: "white-button",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variants;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  disabled,
  className,
  type = "button",
  children,
  ...more
}: ButtonProps) {
  const classes = classnames(buttonStyles[variant], className);

  return (
    <button disabled={disabled} className={classes} type={type} {...more}>
      {children}
    </button>
  );
}
