import React, { useEffect, useState } from "react";
import { CookieBanner } from "@/components/CookieBanner/CookieBanner";
import { Heap } from "@/components/UserTracking/Heap";

const USER_CONSENT_COOKIE_KEY = "cookie_consent";

export const UserTracking = () => {
  const [consentCookies, setConsentCookies] = useState(false);
  const [cookiesSelected, setCookiesSelected] = useState(true);
  const heapId = process.env.NEXT_PUBLIC_HEAP_ID;

  useEffect(() => {
    const consent = localStorage.getItem(USER_CONSENT_COOKIE_KEY);
    setCookiesSelected(!!consent);
    setConsentCookies(consent === "true");
  }, []);

  const handleSetConsentCookies = (allow: boolean) => {
    localStorage.setItem(USER_CONSENT_COOKIE_KEY, `${allow}`);
    setCookiesSelected(true);
    setConsentCookies(allow);
  };

  return (
    <>
      {!cookiesSelected && (
        <CookieBanner handleSetConsentCookies={handleSetConsentCookies} />
      )}
      {consentCookies && <Heap heapId={heapId} />}
    </>
  );
};
