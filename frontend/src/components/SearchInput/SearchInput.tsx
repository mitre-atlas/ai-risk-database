import { InputUnstyled } from "@mui/base";

import { ReactComponent as SearchIcon } from "public/images/icons/search.svg";
import { ReactComponent as RemoveIcon } from "public/images/icons/remove.svg";
import classNames from "classnames";

type SearchInputProps = {
  name: string;
  value: string;
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export const SearchInput = ({
  name,
  value,
  onChange,
  className,
  placeholder,
  onClear,
}: SearchInputProps) => {
  return (
    <InputUnstyled
      name={name}
      value={value}
      onChange={({ target }) => onChange(target.value)}
      slotProps={{
        input: {
          className: classNames(
            "focus:border-brand-blue border-b border-dark focus:outline-0 px-16 font-haffer focus:outline-none",
            className
          ),
        },
      }}
      className="w-full relative"
      placeholder={placeholder}
      startAdornment={
        <SearchIcon
          className="absolute top-1/2 left-5 -translate-y-2/4 w-6 h-6"
          width={24}
          height={24}
        />
      }
      endAdornment={
        value && (
          <div
            onClick={onClear}
            className="absolute top-1/2 right-5 -translate-y-2/4 w-6 h-6 flex items-center justify-center cursor-pointer text-oslo-gray"
          >
            <RemoveIcon width={12} height={12} />
          </div>
        )
      }
    />
  );
};
