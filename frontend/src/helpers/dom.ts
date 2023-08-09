/**
 * Creates a file with JSON text and returns it's URL
 */
export const createJSONFileURL = (jsonString: string, filename: string) => {
  const fileObject = new File([jsonString], filename, {
    type: "application/json",
  });

  return URL.createObjectURL(fileObject);
};

/**
 * Download a file on demand given a dataURL
 */
export const downloadDataURL = (dataURL: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;

  link.click();
};
