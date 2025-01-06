import config from "../config";

class Analytics {
  constructor() {
    this.enabled = config.features.enableAnalytics;
  }

  trackEvent(category, action, label = null, value = null) {
    if (!this.enabled) return;

    if (window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  trackError(error, fatal = false) {
    if (!this.enabled) return;

    if (window.gtag) {
      window.gtag("event", "error", {
        description: error.message,
        fatal: fatal,
      });
    }
  }

  trackTiming(category, variable, value) {
    if (!this.enabled) return;

    if (window.gtag) {
      window.gtag("event", "timing_complete", {
        event_category: category,
        name: variable,
        value: value,
      });
    }
  }
}

export const analytics = new Analytics();
