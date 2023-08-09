import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";

const globalProgressContext = React.createContext({
  enableGlobalProgress: false,
  setEnableGlobalProgress: (() => {}) as (enable: boolean) => void,
});

const { Provider } = globalProgressContext;

export const useGlobalProgress = () => {
  return useContext(globalProgressContext);
};

export const GlobalProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [enableGlobalProgress, setEnableGlobalProgress] = useState(false);

  return (
    <Provider value={{ enableGlobalProgress, setEnableGlobalProgress }}>
      {children}
    </Provider>
  );
};

export const GlobalProgress = () => {
  const { enableGlobalProgress, setEnableGlobalProgress } = useGlobalProgress();
  const router = useRouter();

  useEffect(() => {
    const handleRouteStart = () => {
      setEnableGlobalProgress(true);
    };
    const handleRouteFinish = () => {
      setEnableGlobalProgress(false);
    };

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteFinish);
    router.events.on("routeChangeError", handleRouteFinish);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteFinish);
      router.events.off("routeChangeError", handleRouteFinish);
    };
  }, [setEnableGlobalProgress, router]);

  const classes = classNames("fixed top-0 left-0 w-full z-50", {
    hidden: !enableGlobalProgress,
  });

  return (
    <div className={classes}>
      <LinearProgress
        classes={{ root: "bg-secondary-dark-blue", bar: "bg-brand-blue" }}
      />
    </div>
  );
};
