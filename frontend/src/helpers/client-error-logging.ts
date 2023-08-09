import { datadogLogs } from "@datadog/browser-logs";

const createClientErrorLogger = () => {
  if (process.env.NODE_ENV === "production") {
    datadogLogs.init({
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || "",
      site: "datadoghq.com",
      env: "prod",
      service: "frontend:client",
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    });

    return <E extends Error>(error: E) => {
      datadogLogs.logger.error(error.message, {}, error);
    };
  }

  return () => {};
};

export const logClientError = createClientErrorLogger();
