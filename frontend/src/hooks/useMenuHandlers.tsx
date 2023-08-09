import { useState, MouseEvent } from "react";

export const useMenuHandlers = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = !!anchorEl;

  return { open, anchorEl, handleOpen, handleClose };

  // return [open, anchorEl, handleOpen, handleClose] as [
  //   boolean,
  //   null | HTMLElement,
  //   (event: MouseEvent<HTMLElement>) => void,
  //   () => void
  // ];
};
