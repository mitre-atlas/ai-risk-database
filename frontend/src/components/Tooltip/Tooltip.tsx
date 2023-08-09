import MUITooltip, {
  TooltipProps as MUITooltipProps,
} from "@mui/material/Tooltip";

const tooltipClasses = { tooltip: "!bg-white !text-primary !drop-shadow-lg" };

export const Tooltip = ({
  children,
  title,
  classes = tooltipClasses,
  placement = "top",
  enterTouchDelay = 0,
  ...props
}: MUITooltipProps) => {
  return (
    <MUITooltip
      title={title}
      placement={placement}
      classes={{ ...tooltipClasses, ...classes }}
      enterTouchDelay={enterTouchDelay}
      {...props}
    >
      {children}
    </MUITooltip>
  );
};
