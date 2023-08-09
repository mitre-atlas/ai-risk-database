import { format, parseISO } from "date-fns";

export const formatFromISO = (date: string, dateFormat = "MMM dd, yy") => {
  return format(parseISO(date), dateFormat);
};
