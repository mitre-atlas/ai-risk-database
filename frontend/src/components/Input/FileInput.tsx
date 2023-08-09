import { useFormContext } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";

import { ReactComponent as FileIcon } from "public/images/icons/files.svg";

type FileInputProps = {
  name: string;
  label: string;
};

export const FileInput = ({ name }: FileInputProps) => {
  const { register, unregister, setValue, watch } = useFormContext();
  const files = watch(name);

  const onDrop = useCallback(
    (droppedFiles: any) => {
      setValue(name, droppedFiles, { shouldValidate: true });
    },
    [setValue, name]
  );
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    maxFiles: 3,
    onDrop,
    accept: { "image/*": [] },
    noClick: true,
    noKeyboard: true,
  });

  useEffect(() => {
    register(name);
    return () => unregister();
  }, [register, unregister, name]);

  return (
    <div
      {...getRootProps()}
      className="my-4 border rounded border-dashed border-black-haze border-oslo-gray p-10 flex flex-col justify-center items-center"
    >
      <input
        name={name}
        type="file"
        id={name}
        className="focus:shadow-outline w-full appearance-none py-2 px-3 leading-tight shadow focus:outline-none"
        {...getInputProps()}
      />
      {!files?.length ? (
        <div
          className={classNames(
            "w-full p-2 text-center flex flex-col justify-center items-center",
            {
              ["bg-athens"]: isDragActive,
            }
          )}
        >
          <FileIcon className="opacity-40" />
          <span className="opacity-80 my-4">
            Drag and drop your files here <br /> or
          </span>
          <button type="button" className="primary-button" onClick={open}>
            Select files
          </button>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-1">
          {files.map((file: File) => (
            <span key={file.name}>{file.name}</span>
          ))}
          <button
            type="button"
            className="primary-button place-self-center mt-4"
            onClick={() => setValue(name, undefined)}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
