import classNames from "classnames";
import { Tooltip } from "./Tooltip";
import { ReactComponent as InfoIcon } from "public/images/icons/info.svg";
import { TooltipProps as MUITooltipProps } from "@mui/material/Tooltip";

type InfoIconTooltipProps = {
  title: React.ReactNode;
  className?: string;
  placement?: MUITooltipProps["placement"];
};

export const InfoIconTooltip = ({
  title,
  className,
  placement = "top",
}: InfoIconTooltipProps) => {
  const classes = classNames("w-6 h-6 cursor-pointer", className);

  return (
    <Tooltip title={title} placement={placement}>
      <div>
        <InfoIcon className={classes} />
      </div>
    </Tooltip>
  );
};
