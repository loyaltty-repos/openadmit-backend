// config/cashfreeConfig.js
import { Cashfree } from "cashfree-pg";
import config from "./config.js";

/**
 * Cashfree PG Node SDK:
 * - Install: npm i cashfree-pg
 * - Uses X-Client-Id (App ID) and X-Client-Secret (Secret Key)
 *
 * Environments:
 * - SANDBOX: Cashfree.SANDBOX
 * - PRODUCTION: Cashfree.PRODUCTION
 */

const env =
  (config.CASHFREE_ENV || process.env.CASHFREE_ENV || "SANDBOX").toUpperCase() ===
  "PRODUCTION"
    ? Cashfree.PRODUCTION
    : Cashfree.SANDBOX;

// Configure SDK (works across versions in their SDK docs)
Cashfree.XClientId = config.CASHFREE_KEY_ID || process.env.CASHFREE_KEY_ID;
Cashfree.XClientSecret =
  config.CASHFREE_SECRET_KEY || process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = env;

// Recommended to keep version explicit (docs commonly use 2023-08-01; newer exists too)
export const CASHFREE_API_VERSION =
  config.CASHFREE_API_VERSION || process.env.CASHFREE_API_VERSION || "2023-08-01";

export { Cashfree };
