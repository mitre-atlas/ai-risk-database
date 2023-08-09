import { Tab as MuiTab, Tabs as MuiTabs } from "@mui/material";
import classNames from "classnames";

type TabsProps = {
  children: React.ReactNode;
  activeIndex: string | number;
};

/**
 * Dummy Tabs to compose better for different kinds of views
 */
export const Tabs = ({ children, activeIndex }: TabsProps) => {
  return (
    <MuiTabs
      value={activeIndex}
      sx={{
        "& .MuiTab-root": {
          opacity: "100%",
        },
        "& .MuiTabs-indicator": {
          backgroundColor: "#0129ff",
        },
      }}
    >
      {children}
    </MuiTabs>
  );
};

type TabProps = {
  label: React.ReactNode;
  active?: boolean;
  className?: string;
};

export const Tab = ({ label, active = false, className }: TabProps) => {
  return (
    <MuiTab
      className={classNames(
        "!font-roboto !normal-case !text-oslo-gray !text-sm !font-normal",
        { "!font-medium !text-brand-blue": active },
        className
      )}
      label={label}
    />
  );
};
