/**
 * E2E Test Suite Configuration
 * Provides environment settings, base URLs, credentials, and timeouts.
 */

export const E2E_CONFIG = {
  baseUrl: process.env.E2E_BASE_URL || "http://localhost:3099",
  serverPort: parseInt(process.env.E2E_PORT || "3099", 10),
  adminCredentials: {
    email: process.env.ADMIN_EMAIL || "admin@hcmute.edu.vn",
    password: process.env.ADMIN_PASSWORD || "Admin@Smc2027Secure!",
  },
  timeouts: {
    requestMs: 15000,
    serverStartupMs: 35000,
  },
  testResourcePrefix: "e2e-test-",
};

export default E2E_CONFIG;
