/**
 * Server side
 */
export const getCurrentTermsVersion = () => {
  const version = process.env.NEXT_PUBLIC_TERMS_VERSION;
  if (!version) {
    throw new Error(
      "NEXT_PUBLIC_TERMS_VERSION environment variable is undefined"
    );
  }
  const versionNumber = parseInt(version, 10);

  if (versionNumber <= 0 || isNaN(versionNumber)) {
    throw new Error("NEXT_PUBLIC_TERMS_VERSION must be a positive integer");
  }

  return versionNumber;
};
