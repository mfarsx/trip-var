// Simple API call manager to prevent duplicate calls
class ApiCallManager {
  constructor() {
    this.activeCalls = new Set();
  }

  isCallActive(key) {
    return this.activeCalls.has(key);
  }

  startCall(key) {
    this.activeCalls.add(key);
  }

  endCall(key) {
    this.activeCalls.delete(key);
  }

  async executeCall(key, callFunction) {
    if (this.isCallActive(key)) {
      console.log(`API call ${key} already in progress, skipping...`);
      return;
    }

    this.startCall(key);
    try {
      const result = await callFunction();
      return result;
    } finally {
      this.endCall(key);
    }
  }
}

export const apiCallManager = new ApiCallManager();
export default apiCallManager;