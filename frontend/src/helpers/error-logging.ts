import { createLogger, format, transports } from "winston";

const createErrorLogger = () => {
  if (process.env.NODE_ENV === "production") {
    const httpTransportOptions = {
      host: "http-intake.logs.datadoghq.com",
      path: `/api/v2/logs?dd-api-key=${process.env.DD_KEY}&ddsource=nodejs&service=frontend:server`,
      ssl: true,
    };

    const logger = createLogger({
      level: "error",
      exitOnError: false,
      format: format.json(),
      transports: [new transports.Http(httpTransportOptions)],
      exceptionHandlers: [new transports.Http(httpTransportOptions)],
      rejectionHandlers: [new transports.Http(httpTransportOptions)],
    });

    return <E extends Error>(error: E) => {
      logger.error(error.message, {
        error: { message: error.message, stack: error.stack },
      });
    };
  }

  return () => {};
};

export const logError = createErrorLogger();
