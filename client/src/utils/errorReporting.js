import * as Sentry from "@sentry/react";
import config from "../config";

export const initializeErrorReporting = () => {
  if (config.features.enableErrorReporting && config.sentryDsn) {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.environment,
      release: config.version,
      tracesSampleRate: 1.0,
    });
  }
};

export const captureError = (error, context = {}) => {
  console.error(error);
  if (config.features.enableErrorReporting) {
    Sentry.captureException(error, { extra: context });
  }
};
