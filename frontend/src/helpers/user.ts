import { getCurrentTermsVersion } from "./env";

export const shouldAcceptTerms = (termsVersion: number | null) => {
  if (!termsVersion) return true;
  if (termsVersion < getCurrentTermsVersion()) {
    return true;
  }

  return false;
};
