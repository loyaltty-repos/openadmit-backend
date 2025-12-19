// config/cashfreeConfig.js
import { Cashfree as CashfreeSDK } from "cashfree-pg";
import config from "./config.js";

export const CASHFREE_API_VERSION =
  config.CASHFREE_API_VERSION || process.env.CASHFREE_API_VERSION || "2023-08-01";

const ENV_STR = (config.CASHFREE_ENV || process.env.CASHFREE_ENV || "SANDBOX").toUpperCase();
const CLIENT_ID = config.CASHFREE_KEY_ID || process.env.CASHFREE_KEY_ID;
const CLIENT_SECRET = config.CASHFREE_SECRET_KEY || process.env.CASHFREE_SECRET_KEY;

// v5 environments are CashfreeSDK.SANDBOX / CashfreeSDK.PRODUCTION :contentReference[oaicite:2]{index=2}
const env =
  ENV_STR === "PRODUCTION" ? CashfreeSDK.PRODUCTION : CashfreeSDK.SANDBOX;

// ✅ v5+ prefers instance client: new Cashfree(env, id, secret) :contentReference[oaicite:3]{index=3}
let cashfreeClient = null;
try {
  cashfreeClient = new CashfreeSDK(env, CLIENT_ID, CLIENT_SECRET);
} catch (e) {
  // If constructor isn’t available (older SDK), we’ll fall back to static config below
  cashfreeClient = null;
}

// ✅ v4 fallback: set static keys + environment :contentReference[oaicite:4]{index=4}
if (!cashfreeClient) {
  CashfreeSDK.XClientId = CLIENT_ID;
  CashfreeSDK.XClientSecret = CLIENT_SECRET;
  CashfreeSDK.XEnvironment =
    CashfreeSDK.Environment?.[ENV_STR] || CashfreeSDK.Environment?.SANDBOX;
}

// Universal caller that supports both:
// - v5: cashfreeClient.PGCreateOrder(request)
// - v4: CashfreeSDK.PGCreateOrder(apiVersion, request)
export async function callCashfree(methodName, ...args) {
  // Prefer instance methods (v5+)
  if (cashfreeClient && typeof cashfreeClient[methodName] === "function") {
    return cashfreeClient[methodName](...args);
  }

  // Fallback to static methods (v4)
  if (typeof CashfreeSDK[methodName] === "function") {
    return CashfreeSDK[methodName](CASHFREE_API_VERSION, ...args);
  }

  throw new Error(`Cashfree SDK method not found: ${methodName}`);
}

export { cashfreeClient, CashfreeSDK as Cashfree };
