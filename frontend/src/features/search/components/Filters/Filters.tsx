import classNames from "classnames";
import { useState } from "react";
import { FilterOptionSelector } from "./FilterOptionSelector";

type FiltersProps = {
  filters: Record<string, string[]>;
  currentFilters: string;
  onClose: (filterString: string) => void;
  className?: string;
};

export const Filters = ({
  filters,
  onClose,
  currentFilters,
  className,
}: FiltersProps) => {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );
  const currentFiltersRecord = currentFilters
    .split(";")
    .map(value => value.split(":"))
    .reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

  // collects filter string from each individual filter and calls
  // the callback with the joined filters query
  const handleFilterClose = (key: string) => (value: string) => {
    const newFilters = { ...appliedFilters, [key]: value };
    const filtersQuery = Object.entries(newFilters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}:${value}`)
      .sort()
      .join(";");

    onClose(filtersQuery);
    setAppliedFilters(newFilters);
  };

  return (
    <div className={classNames("flex [&>*]:mr-2", className)}>
      {Object.entries(filters).map(([key, values]) => (
        <FilterOptionSelector
          key={key}
          name={key}
          label={key.replace("_", " ")}
          currentFilters={currentFiltersRecord[key] || ""}
          onClose={handleFilterClose(key)}
          options={values}
        />
      ))}
    </div>
  );
};
