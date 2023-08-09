import { useEffect, useState, ChangeEvent, useMemo } from "react";
import classNames from "classnames";
import { InputUnstyled } from "@mui/base";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ReactComponent as ChevronIcon } from "public/images/icons/chevron.svg";
import { ReactComponent as SearchIcon } from "public/images/icons/search.svg";
import { debounce } from "@/helpers/input";
import { FilterOptionButton } from "./Buttons";
import { Checkbox } from "@/components/Checkbox/Checkbox";

type FilterOptionSelectorProps = {
  name: string;
  label: string;
  onClose: (values: string) => void;
  currentFilters: string;
  options: string[];
};

/**
 * Gives selected values as single parameter array string for onClose callback
 * onClose callback gets filters as argument
 */
export const FilterOptionSelector = ({
  name,
  label,
  onClose,
  currentFilters,
  options,
}: FilterOptionSelectorProps) => {
  const [search, setSearch] = useState("");
  const availableOptions = search
    ? options.filter(value => new RegExp(`.*${search}.*`, "i").test(value))
    : options;

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const selectedFilters = currentFilters
      .split(",")
      .filter(value => value)
      .reduce((acc, value) => {
        acc[value] = true;
        return acc;
      }, {} as Record<string, boolean>);

    setSelectedOptions(selectedFilters);
  }, [currentFilters]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = !!anchorEl;

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (availableOptions.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);

    const selectedString = Object.entries(selectedOptions)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .sort()
      .join(",");
    onClose(selectedString);
    // reset search when closing the filter
    setSearch("");
  };

  const handleItemClick = (value: string) => () => {
    if (selectedOptions[value]) {
      setSelectedOptions(state => ({ ...state, [value]: false }));
      return;
    }

    setSelectedOptions(state => ({ ...state, [value]: true }));
  };

  const handleInput = useMemo(
    () =>
      debounce(
        (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value.trim()),
        300
      ),
    []
  );

  const selectedCount = Object.values(selectedOptions).reduce(
    (acc, value) => acc + (value ? 1 : 0),
    0
  );

  // sort so the selected values stay on top of the list
  const currentOptions = [...availableOptions].sort((a, b) => {
    if (selectedOptions[a] && !selectedOptions[b]) return -1;
    if (selectedOptions[b] && !selectedOptions[a]) return 1;
    return 0;
  });

  const classes = classNames(
    "mr-2 px-2 bg-light-gray group-hover:bg-dark-gray rounded-full",
    { "!bg-dark-gray": open }
  );

  return (
    <div>
      <FilterOptionButton
        onClick={handleButtonClick}
        open={open}
        className="group"
      >
        <div className="flex items-center">
          <span className="mr-3 capitalize">{label}</span>
          {selectedCount > 0 && (
            <span className={classes}>{selectedCount}</span>
          )}
          <ChevronIcon />
        </div>
      </FilterOptionButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="mt-2"
      >
        <MenuItem>
          <InputUnstyled
            className="w-full bg-white flex p-1 rounded"
            placeholder="Search"
            slotProps={{
              input: {
                className: "w-full border-none outline-none text-sm leading-6",
              },
            }}
            startAdornment={<SearchIcon className="mr-2" />}
            name={`search-${name}`}
            onChange={handleInput}
          />
        </MenuItem>
        {currentOptions.map(value => (
          <MenuItem
            className="text-sm leading-6"
            key={value}
            onClick={handleItemClick(value)}
          >
            <div className="flex justify-between items-center w-full">
              <span>{value}</span>{" "}
              <Checkbox checked={!!selectedOptions[value]} />
            </div>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
