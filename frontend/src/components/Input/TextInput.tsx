import React, { forwardRef } from "react";
import {
  useController,
  UseControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TextField as MuiTextField, TextFieldProps } from "@mui/material";

const customStyle = {
  "& .MuiInputBase-root.MuiInputBase-colorPrimary.Mui-focused": {
    "& > fieldset, label": {
      borderColor: "#0129ff",
    },
  },
  "& .MuiFormLabel-root.Mui-focused": {
    color: "#0129ff",
  },
};

export const TextInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: UseControllerProps<TFieldValues, TName> & {
    label: string;
    muiProps?: TextFieldProps;
    helperText?: string;
  }
) => {
  const { field, fieldState } = useController(props);

  return (
    <MuiTextField
      {...field}
      variant="outlined"
      label={props.label}
      error={!!fieldState.error}
      helperText={fieldState.error?.message || props.helperText}
      sx={customStyle}
      {...props.muiProps}
    />
  );
};

/**
 * This one is for when we need just the base component
 */
export const TextField = forwardRef(function TextField(
  props: TextFieldProps,
  ref: any
) {
  return (
    <MuiTextField ref={ref} variant="outlined" sx={customStyle} {...props} />
  );
});
