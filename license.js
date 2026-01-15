/**
 * License Validation Module for Accessibility Tool
 *
 * Provides license validation with caching and fail-open behavior.
 * Supports both free and paid feature modes.
 *
 * Usage:
 *   import { validateLicense, isLicenseValid, hasPaidFeatures } from './license.js';
 *
 *   // Basic validation
 *   const result = await validateLicense({
 *     licenseKey: process.env.ACCESS_LICENSE_KEY, // Contact us for license key
 *     domain: 'example.edu'
 *   });
 *
 *   // Check features
 *   if (hasPaidFeatures()) {
 *     // Enable paid features like report export
 *   }
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const LICENSE_API_URL = "https://api.licensegate.io/v1/validate";
const CACHE_FILE = ".tool-license-cache.json";
const CACHE_TTL_HOURS = 24;

/**
 * License validation result structure
 * @typedef {Object} LicenseResult
 * @property {boolean} valid - Whether the license is valid
 * @property {boolean} expired - Whether the license has expired
 * @property {boolean} domainMatch - Whether the domain matches
 * @property {string} tier - License tier ('free' | 'pro' | 'enterprise')
 * @property {Date|null} expiresAt - License expiration date
 * @property {string|null} error - Error message if validation failed
 * @property {boolean} fromCache - Whether result came from cache
 */

/**
 * Get cache file path (in project root)
 * @returns {string} Path to cache file
 */
function getCachePath() {
  return join(__dirname, CACHE_FILE);
}

/**
 * Read cached license result
 * @returns {LicenseResult|null} Cached result or null
 */
function readCache() {
  try {
    const cachePath = getCachePath();
    if (!existsSync(cachePath)) {
      return null;
    }

    const cached = JSON.parse(readFileSync(cachePath, "utf-8"));
    const now = Date.now();
    const cachedTime = new Date(cached.timestamp).getTime();
    const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;

    // Check if cache is still valid
    if (now - cachedTime < ttlMs) {
      return cached.result;
    }

    return null; // Cache expired
  } catch (error) {
    // Cache read failure - proceed without cache
    return null;
  }
}

/**
 * Write license result to cache
 * @param {LicenseResult} result - Result to cache
 */
function writeCache(result) {
  try {
    const cachePath = getCachePath();
    const cacheData = {
      timestamp: new Date().toISOString(),
      result,
    };
    writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    // Cache write failure - proceed without caching
    console.warn("[License] Failed to write cache:", error.message);
  }
}

/**
 * Validate license key format (basic client-side check)
 * @param {string} licenseKey - License key to validate
 * @returns {boolean} Whether format is valid
 */
function isValidLicenseKeyFormat(licenseKey) {
  if (!licenseKey || typeof licenseKey !== "string") {
    return false;
  }

  // License typically uses UUID format or similar
  // Adjust pattern based on actual license key format
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const simplePattern = /^[A-Z0-9]{16,}$/i;

  return uuidPattern.test(licenseKey) || simplePattern.test(licenseKey);
}

/**
 * Call authorization API
 * @param {string} licenseKey - License key
 * @param {string} domain - Domain to validate
 * @returns {Promise<LicenseResult>} Validation result
 */
async function callLicenseApi(licenseKey, domain) {
  try {
    const response = await fetch(LICENSE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        license_key: licenseKey,
        domain: domain,
        product_id: "react-accessibility-tool", // Your product identifier
      }),
    });

    if (!response.ok) {
      // API returned error - fail open
      console.warn(`[License] API error: ${response.status} ${response.statusText}`);
      return createFailOpenResult("API error - allowing free mode");
    }

    const data = await response.json();

    // Transform API response to our format
    return {
      valid: data.valid === true && data.domain_match === true && data.expired !== true,
      expired: data.expired === true || false,
      domainMatch: data.domain_match === true,
      tier: data.tier || "free",
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      error: data.error || null,
      fromCache: false,
    };
  } catch (error) {
    // Network or parse error - fail open
    console.warn(`[License] API call failed: ${error.message} - allowing free mode`);
    return createFailOpenResult(`Network error: ${error.message}`);
  }
}

/**
 * Create a fail-open result (allows free mode)
 * @param {string} reason - Reason for fail-open
 * @returns {LicenseResult} Fail-open result
 */
function createFailOpenResult(reason) {
  return {
    valid: false,
    expired: false,
    domainMatch: false,
    tier: "free",
    expiresAt: null,
    error: reason,
    fromCache: false,
  };
}

// Cache the last validation result in memory
let cachedResult = null;

/**
 * Validate a license key and domain
 *
 * @param {Object} options - Validation options
 * @param {string} options.licenseKey - License key (optional)
 * @param {string} options.domain - Domain to validate (optional)
 * @returns {Promise<LicenseResult>} Validation result
 *
 * @example
 * const result = await validateLicense({
 *   licenseKey: process.env.ACCESS_LICENSE_KEY,
 *   domain: 'example.edu'
 * });
 *
 * if (result.valid) {
 *   console.log('License is valid for paid features');
 * } else {
 *   console.log('Using free mode:', result.error);
 * }
 */
export async function validateLicense({ licenseKey, domain } = {}) {
  // No license provided - free mode
  if (!licenseKey) {
    return createFailOpenResult("No license key provided");
  }

  // Invalid license key format - fail but don't block
  if (!isValidLicenseKeyFormat(licenseKey)) {
    console.warn("[License] Invalid license key format - allowing free mode");
    return createFailOpenResult("Invalid license key format");
  }

  // Check memory cache first
  if (cachedResult && cachedResult.fromCache === true) {
    // If we have a fresh cached result (fromCache), use it
    const cacheAge = Date.now() - new Date(cachedResult.timestamp || 0).getTime();
    const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;

    if (cacheAge < ttlMs) {
      return { ...cachedResult, fromCache: true };
    }
  }

  // Check file cache
  const fileCache = readCache();
  if (fileCache) {
    cachedResult = fileCache;
    return { ...fileCache, fromCache: true };
  }

  // Need to call API (domain required for validation)
  if (!domain) {
    console.warn("[License] Domain required for validation - allowing free mode");
    return createFailOpenResult("Domain required");
  }

  // Call authorization API
  const result = await callLicenseApi(licenseKey, domain);

  // Cache the result (even fail-open results for cache TTL)
  cachedResult = result;
  writeCache(result);

  return result;
}

/**
 * Check if paid features are enabled
 * Must be called after validateLicense()
 *
 * @returns {boolean} Whether paid features are available
 *
 * @example
 * import { validateLicense, hasPaidFeatures } from './license.js';
 *
 * await validateLicense({ licenseKey, domain });
 *
 * if (hasPaidFeatures()) {
 *   // Enable report export, compliance status, etc.
 * }
 */
export function hasPaidFeatures() {
  if (!cachedResult) {
    return false;
  }

  // Paid tiers: pro, enterprise
  const paidTiers = ["pro", "enterprise"];
  return paidTiers.includes(cachedResult.tier) && cachedResult.valid;
}

/**
 * Check if license is valid
 *
 * @returns {boolean} Whether license is valid
 */
export function isLicenseValid() {
  return cachedResult?.valid === true;
}

/**
 * Get current license info
 *
 * @returns {LicenseResult|null} Current license result
 */
export function getLicenseInfo() {
  return cachedResult;
}

/**
 * Clear cached license result (for testing or logout)
 */
export function clearLicenseCache() {
  cachedResult = null;

  try {
    const cachePath = getCachePath();
    if (existsSync(cachePath)) {
      // Instead of deleting, we could overwrite with expired data
      // But for now, just let it expire naturally
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Get license status message for display
 *
 * @param {LicenseResult} result - License result
 * @returns {string} User-friendly status message
 */
export function getLicenseStatusMessage(result = cachedResult) {
  if (!result) {
    return "License status unknown - using free mode";
  }

  if (result.valid) {
    return `License valid (${result.tier} tier)`;
  }

  if (result.expired) {
    return "License expired - using free mode";
  }

  if (!result.domainMatch) {
    return "License domain mismatch - using free mode";
  }

  if (result.error) {
    return `License validation failed: ${result.error} - using free mode`;
  }

  return "Invalid license - using free mode";
}

export default {
  validateLicense,
  hasPaidFeatures,
  isLicenseValid,
  getLicenseInfo,
  clearLicenseCache,
  getLicenseStatusMessage,
};
