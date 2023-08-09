import React from "react";
import { SortingSelectorButton } from "./Sort";
import { FilterButton } from "./Filters/Buttons";
import { ResultTypes } from "../types";
import classNames from "classnames";

type SearchOptionsProps = {
  onSortChange: (value: string) => void;
  resultType: ResultTypes;
  onFiltersClick: () => void;
  currentSort: string;
  className?: string;
  sortClasses?: string;
  filterClasses?: string;
  currentFilter: string;
};

export const SearchOptions = ({
  onSortChange,
  resultType,
  onFiltersClick,
  currentSort,
  className,
  sortClasses,
  filterClasses,
  currentFilter,
}: SearchOptionsProps) => {
  return (
    <div className={className}>
      <SortingSelectorButton
        className={classNames("mr-6", sortClasses)}
        onChange={onSortChange}
        resultType={resultType}
        currentSort={currentSort}
      />
      <FilterButton
        className={filterClasses}
        enabled={!!currentFilter}
        onClick={onFiltersClick}
      />
    </div>
  );
};
