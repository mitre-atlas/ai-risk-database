import { PaginationRenderItemParams } from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";

export const renderPaginationItem = (item: PaginationRenderItemParams) => {
  return (
    <PaginationItem
      {...item}
      classes={{
        root: "text-oslo-gray",
        selected: "text-white !bg-brand-blue",
      }}
    />
  );
};
