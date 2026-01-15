/**
 * NPM Package Authorization Module
 *
 * Cross-platform license authorization for npm packages.
 * Works on macOS, Linux, Windows - Node.js 18+
 * Compatible with bundlers (esbuild, tsup, webpack)
 *
 * Features:
 * - Domain-bound licensing
 * - Usage tracking
 * - 24-hour cache
 * - Fail-open behavior
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Bundler-safe __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment detection for cross-platform paths
const isWindows = process.platform === "win32";
const ENV_CACHE_PREFIX = "A11Y_TOOL_";

// Tool version - bundler-safe constant
const TOOL_VERSION = "1.0.4";

// Default configuration
const CONFIG = {
  LICENSE_API_URL: "https://api.licensegate.io/v1/authorize",
  CACHE_TTL_HOURS: 24,
  MAX_USAGE_ENTRIES: 100,
  PAID_TIERS: ["pro", "enterprise"],
};

/**
 * Get cross-platform cache directory
 * Uses environment variable if set, otherwise uses module directory
 * Cross-platform safe path handling with bundler compatibility
 */
function getCacheDir() {
  // Allow override via environment variable for containerized/CI environments
  if (process.env[ENV_CACHE_PREFIX + "CACHE_DIR"]) {
    return process.env[ENV_CACHE_PREFIX + "CACHE_DIR"];
  }
  // Use module directory for self-contained caching
  // Use __dirname for cross-platform and bundler compatibility
  return __dirname;
}

/**
 * Get cache file path (cross-platform safe)
 */
function getCachePath() {
  const cacheDir = getCacheDir();
  return join(cacheDir, ".tool-license-cache.json");
}

/**
 * Get usage file path (cross-platform safe)
 */
function getUsagePath() {
  const cacheDir = getCacheDir();
  return join(cacheDir, ".tool-usage.json");
}

/**
 * Safe JSON parse with fallback
 */
function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Read cached license result
 */
function readCache() {
  try {
    const cachePath = getCachePath();
    if (!existsSync(cachePath)) return null;

    const content = readFileSync(cachePath, "utf-8");
    const cached = safeJsonParse(content, null);
    if (!cached?.result) return null;

    const now = Date.now();
    const cachedTime = new Date(cached.timestamp).getTime();
    const ttlMs = CONFIG.CACHE_TTL_HOURS * 60 * 60 * 1000;

    return now - cachedTime < ttlMs ? cached : null;
  } catch {
    return null;
  }
}

/**
 * Write license result to cache (fail-safe)
 */
function writeCache(result) {
  try {
    const cachePath = getCachePath();
    const cacheData = {
      timestamp: new Date().toISOString(),
      result,
    };
    writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  } catch {
    // Silent fail - cache is optional
  }
}

/**
 * Read usage tracking data (fail-safe)
 */
function readUsage() {
  try {
    const usagePath = getUsagePath();
    if (!existsSync(usagePath)) return null;

    const content = readFileSync(usagePath, "utf-8");
    return safeJsonParse(content, null);
  } catch {
    return null;
  }
}

/**
 * Write usage tracking (fail-safe)
 */
function writeUsage(usage) {
  try {
    const usagePath = getUsagePath();
    writeFileSync(usagePath, JSON.stringify(usage, null, 2));
  } catch {
    // Silent fail - usage tracking is optional
  }
}

/**
 * Get package info from package.json (bundler-safe)
 */
function getPackageInfo() {
  try {
    // Try to get from package.json in module directory
    const packageJsonPath = join(getCacheDir(), "package.json");
    if (!existsSync(packageJsonPath)) return null;

    const content = readFileSync(packageJsonPath, "utf-8");
    const pkg = safeJsonParse(content, null);
    if (!pkg) return null;

    return {
      name: pkg.name || "unknown",
      version: pkg.version || "1.0.0",
    };
  } catch {
    return null;
  }
}

/**
 * Validate license key format (bundler-safe, minification-safe)
 */
function isValidLicenseKeyFormat(licenseKey) {
  if (!licenseKey || typeof licenseKey !== "string") return false;

  // UUID pattern (8-4-4-4-12 hex)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Simple pattern (16+ alphanumeric)
  const simplePattern = /^[A-Z0-9]{16,}$/i;

  return uuidPattern.test(licenseKey) || simplePattern.test(licenseKey);
}

/**
 * Normalize domain for consistent comparison (cross-platform)
 */
function normalizeDomain(domain) {
  if (!domain || typeof domain !== "string") return null;

  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^\/*/, "")
    .replace(/\/.*$/, "")
    .trim();
}

/**
 * Call authorization API (fail-safe)
 */
async function callAuthorizationApi(licenseKey, domain, packageInfo) {
  try {
    const response = await fetch(CONFIG.LICENSE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        license_key: licenseKey,
        domain: normalizeDomain(domain),
        package_name: packageInfo?.name || "unknown",
        package_version: packageInfo?.version || "unknown",
        environment: "node",
        platform: process.platform,
      }),
    });

    if (!response.ok) {
      return { authorized: false, error: `API_ERROR:${response.status}` };
    }

    const data = await response.json();
    return safeJsonParse(JSON.stringify(data), { authorized: false, error: "PARSE_ERROR" });
  } catch (error) {
    return { authorized: false, error: `NETWORK_ERROR:${error.message}` };
  }
}

/**
 * Track package usage (fail-safe)
 */
function trackUsage(packageInfo, domain) {
  try {
    const usage = readUsage() || {
      firstUsed: new Date().toISOString(),
      uses: [],
    };

    usage.lastUsed = new Date().toISOString();
    usage.packageName = packageInfo?.name || "unknown";
    usage.packageVersion = packageInfo?.version || "unknown";
    usage.domain = normalizeDomain(domain);

    // Add usage entry
    usage.uses.push({
      timestamp: new Date().toISOString(),
      domain: normalizeDomain(domain),
    });

    // Keep only recent entries
    if (usage.uses.length > CONFIG.MAX_USAGE_ENTRIES) {
      usage.uses = usage.uses.slice(-CONFIG.MAX_USAGE_ENTRIES);
    }

    writeUsage(usage);
  } catch {
    // Silent fail - tracking is optional
  }
}

/**
 * Main authorization function
 *
 * @param {Object} options - Authorization options
 * @param {string} options.licenseKey - License key (optional)
 * @param {string} options.domain - Domain to authorize (optional)
 * @returns {Promise<Object>} Authorization result
 */
export async function authorizeUsage({ licenseKey, domain } = {}) {
  const normalizedDomain = normalizeDomain(domain);
  const packageInfo = getPackageInfo();

  // No license provided - free mode
  if (!licenseKey) {
    return createFreeResult("No license key provided");
  }

  // Invalid format check
  if (!isValidLicenseKeyFormat(licenseKey)) {
    return createFreeResult("Invalid license key format");
  }

  // Check cache first
  const cached = readCache();
  if (cached?.result) {
    trackUsage(packageInfo, normalizedDomain);
    return {
      ...cached.result,
      fromCache: true,
    };
  }

  // Domain required for authorization
  if (!normalizedDomain) {
    return createFreeResult("Domain required for authorization");
  }

  // Call authorization API
  const apiResult = await callAuthorizationApi(licenseKey, normalizedDomain, packageInfo);

  // Build result
  const result = apiResult.authorized
    ? {
        valid: true,
        authorized: true,
        tier: apiResult.tier || "pro",
        expiresAt: apiResult.expires_at ? new Date(apiResult.expires_at) : null,
        domain: normalizedDomain,
        authorizedAt: new Date().toISOString(),
        message: `${(apiResult.tier || "PRO").toUpperCase()} license authorized`,
        fromCache: false,
      }
    : createFreeResult(apiResult.error || "Authorization failed");

  // Cache and track
  writeCache(result);
  trackUsage(packageInfo, normalizedDomain);

  return result;
}

/**
 * Create free mode result (fail-open)
 */
function createFreeResult(reason) {
  return {
    valid: false,
    authorized: false,
    tier: "free",
    expiresAt: null,
    error: reason,
    message: `Free mode - ${reason}`,
    fromCache: false,
  };
}

/**
 * Check if paid features are enabled
 *
 * @param {Object} authResult - Authorization result
 * @returns {boolean} Whether paid features are available
 */
export function hasPaidFeatures(authResult) {
  if (!authResult) return false;
  return CONFIG.PAID_TIERS.includes(authResult.tier) && authResult.authorized === true;
}

/**
 * Check if PRO or higher tier
 *
 * @param {Object} authResult - Authorization result
 * @returns {boolean} Whether PRO features are available
 */
export function isProOrHigher(authResult) {
  return hasPaidFeatures(authResult);
}

/**
 * Check if fully authorized (valid + authorized)
 *
 * @param {Object} authResult - Authorization result
 * @returns {boolean} Whether fully authorized
 */
export function isFullyAuthorized(authResult) {
  return authResult?.authorized === true && authResult?.valid === true;
}

/**
 * Get authorization status message
 *
 * @param {Object} authResult - Authorization result
 * @returns {string} User-friendly status message
 */
export function getAuthStatusMessage(authResult) {
  if (!authResult) return "Free mode active";

  if (authResult.valid && authResult.authorized) {
    const tier = (authResult.tier || "PRO").toUpperCase();
    let message = `✅ ${tier} license authorized`;
    if (authResult.expiresAt) {
      const expiryDate = new Date(authResult.expiresAt).toLocaleDateString();
      message += ` (expires ${expiryDate})`;
    }
    return message;
  }

  return `⚠️  ${authResult.message || "Free mode active"}`;
}

/**
 * Clear all caches (for logout/reset)
 */
export function clearAuthCache() {
  try {
    const cachePath = getCachePath();
    const usagePath = getUsagePath();

    if (existsSync(cachePath)) writeFileSync(cachePath, "{}");
    if (existsSync(usagePath)) writeFileSync(usagePath, "{}");
  } catch {
    // Silent fail - cache clear is best-effort
  }
}

/**
 * Get usage statistics
 *
 * @returns {Object|null} Usage statistics
 */
export function getUsageStats() {
  return readUsage();
}

/**
 * Get configuration (for testing/debugging)
 *
 * @returns {Object} Current configuration
 */
export function getConfig() {
  return { ...CONFIG };
}

/**
 * Export license metadata for PRO outputs
 *
 * @param {Object} authResult - Authorization result
 * @returns {Object} License metadata for reports
 */
export function getLicenseMetadata(authResult) {
  if (!hasPaidFeatures(authResult)) {
    return null;
  }

  return {
    tier: authResult.tier,
    licensed: true,
    domain: authResult.domain,
    authorizedAt: authResult.authorizedAt,
    expiresAt: authResult.expiresAt,
  };
}

export default {
  authorizeUsage,
  hasPaidFeatures,
  isProOrHigher,
  isFullyAuthorized,
  getAuthStatusMessage,
  clearAuthCache,
  getUsageStats,
  getConfig,
  getLicenseMetadata,
};
