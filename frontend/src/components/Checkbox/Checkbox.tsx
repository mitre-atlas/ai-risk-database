import MuiCheckbox from "@mui/material/Checkbox";
import { ReactComponent as CheckboxIcon } from "public/images/icons/checkbox.svg";
import { ReactComponent as CheckboxCheckedIcon } from "public/images/icons/checkbox-checked.svg";

export const Checkbox = ({ checked }: { checked: boolean }) => {
  return (
    <MuiCheckbox
      checked={checked}
      icon={<CheckboxIcon className="w-6 h-6" />}
      checkedIcon={<CheckboxCheckedIcon className="w-6 h-6" />}
    />
  );
};
