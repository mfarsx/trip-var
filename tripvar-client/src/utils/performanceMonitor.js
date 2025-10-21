// Performance monitoring utility for development
class PerformanceMonitor {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
    this.renderCounts = new Map();
    this.actionCounts = new Map();
  }

  trackRender(componentName) {
    if (!this.isDevelopment) return;

    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);

    if (count > 10) {
      console.warn(
        `⚠️ ${componentName} has rendered ${
          count + 1
        } times - possible performance issue`
      );
    }
  }

  trackAction(actionType) {
    if (!this.isDevelopment) return;

    const count = this.actionCounts.get(actionType) || 0;
    this.actionCounts.set(actionType, count + 1);

    if (count > 20) {
      console.warn(
        `⚠️ Action ${actionType} dispatched ${
          count + 1
        } times - possible performance issue`
      );
    }
  }

  getStats() {
    if (!this.isDevelopment) return {};

    return {
      renderCounts: Object.fromEntries(this.renderCounts),
      actionCounts: Object.fromEntries(this.actionCounts),
    };
  }

  reset() {
    this.renderCounts.clear();
    this.actionCounts.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
