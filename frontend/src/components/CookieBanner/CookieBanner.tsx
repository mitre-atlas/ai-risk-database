import React from "react";

import { Button } from "@/components/Button/Button";

type CookieBannerProps = {
  handleSetConsentCookies: (allow: boolean) => void;
};

export const CookieBanner = ({
  handleSetConsentCookies,
}: CookieBannerProps) => {
  return (
    <div className="fixed bg-white lg:left-12 lg:bottom-12 bottom-0 left-0 p-8 shadow-cookieBanner z-50 flex flex-col lg:max-w-[525px] w-full">
      <span className="font-medium text-xl text-primary mb-2">
        This website uses cookies
      </span>
      <span className="text-sm text-shuttle-gray my-2">
        We use cookies to personalise content and ads, to provide social media
        features and to analyse our traffic. We also share information about
        your use of our site with our social media, advertising and analytics
        partners who may combine it with other information that you’ve provided
        to them or that they’ve collected from your use of their services.
      </span>
      <div className="mt-4 flex gap-4">
        <Button onClick={() => handleSetConsentCookies(false)}>Deny</Button>
        <Button variant="blue" onClick={() => handleSetConsentCookies(true)}>
          Allow All
        </Button>
      </div>
    </div>
  );
};
