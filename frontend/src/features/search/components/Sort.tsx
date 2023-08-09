import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import classNames from "classnames";
import { useState } from "react";
import { ReactComponent as SortIcon } from "public/images/icons/sort.svg";
import { OptionButton } from "./OptionButton";
import { ResultTypes } from "../types";

export type SortTuple = [label: string, value: string];

const defaultSorting: SortTuple = ["Default sorting", ""];

export const modelsSortOptions: SortTuple[] = [
  defaultSorting,
  ["Name (Ascending)", "name:asc"],
  ["Name (Descending)", "name:desc"],
  ["Date (Newest to oldest)", "date:desc"],
  ["Date (Oldest to newest)", "date:asc"],
  ["PURL (Ascending)", "purl:asc"],
  ["PURL (Descending)", "purl:desc"],
  ["Reports (More reports)", "reports:desc"],
  ["Reports (Less reports)", "reports:asc"],
  ["Scans (More scans)", "scans:desc"],
  ["Scans (Less scans)", "scans:asc"],
  ["Vulnerabilities (More issues)", "vulns:desc"],
  ["Vulnerabilities (Less issues)", "vulns:asc"],
];

export const reportsSortOptions: SortTuple[] = [
  defaultSorting,
  ["Votes (Most voted first)", "votes:desc"],
  ["Votes (Less voted first)", "votes:asc"],
  ["Title (Ascending)", "title:asc"],
  ["Title (Descending)", "title:desc"],
  ["Date (Newest first)", "date:desc"],
  ["Date (Oldest first)", "date:asc"],
];

export const artifactsSortOptions: SortTuple[] = [
  defaultSorting,
  ["Name (Ascending)", "name:asc"],
  ["Name (Descending)", "name:desc"],
  ["Count (More occurrences)", "count:desc"],
  ["Count (Less occurrences)", "count:asc"],
  ["Date (Newest first)", "date:desc"],
  ["Date (Oldest first)", "date:asc"],
];

export const sortOptionsMap = {
  models: modelsSortOptions,
  reports: reportsSortOptions,
  artifacts: artifactsSortOptions,
};

type SortingSelectorButtonProps = {
  className?: string;
  onChange: (value: string) => void;
  currentSort: string;
  resultType: ResultTypes;
};

export const SortingSelectorButton = ({
  onChange,
  className,
  resultType,
  currentSort,
}: SortingSelectorButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const options = sortOptionsMap[resultType];

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (options.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (value: string) => () => {
    onChange && onChange(value);
    handleClose();
  };

  const open = !!anchorEl;

  return (
    <>
      <OptionButton
        label="Sort"
        icon={<SortIcon className="w-6 h-6 mr-2 inline-block" />}
        className={classNames(className, {
          "text-brand-blue": !!currentSort,
        })}
        onClick={handleButtonClick}
      />
      <Menu
        className="mt-2"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map(([label, value]) => (
          <MenuItem
            key={label}
            onClick={handleMenuClick(value)}
            className={classNames("text-sm leading-6", {
              "font-bold": value === currentSort,
            })}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
