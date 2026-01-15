/**
 * Browser-Compatible License Validation Module
 *
 * Works in browsers, WordPress, PHP-generated pages, CDN-based projects.
 * Uses localStorage instead of file system for caching.
 *
 * CDN Usage:
 *   <script src="https://cdn.yoursite.com/license-validate.js"></script>
 *   <script>
 *     const result = await LicenseValidate.validate({
 *       licenseKey: 'your-key', // Contact us for license key
 *       domain: 'example.com'
 *     });
 *   </script>
 *
 * WordPress/PHP Usage:
 *   Include the script in your header.php or via wp_enqueue_script
 */

(function (global) {
  "use strict";

  // Configuration
  const LICENSE_API_URL = "https://api.licensegate.io/v1/validate";
  const CACHE_KEY = "a11y_license_cache";
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
   * BrowserStorage wrapper for localStorage
   */
  const BrowserStorage = {
    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  /**
   * Read cached license result
   * @returns {LicenseResult|null}
   */
  function readCache() {
    const cached = BrowserStorage.get(CACHE_KEY);
    if (!cached) return null;

    const now = Date.now();
    const cachedTime = new Date(cached.timestamp).getTime();
    const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;

    if (now - cachedTime < ttlMs) {
      return cached.result;
    }
    return null;
  }

  /**
   * Write license result to cache
   * @param {LicenseResult} result
   */
  function writeCache(result) {
    BrowserStorage.set(CACHE_KEY, {
      timestamp: new Date().toISOString(),
      result,
    });
  }

  /**
   * Validate license key format (basic client-side check)
   * @param {string} licenseKey
   * @returns {boolean}
   */
  function isValidLicenseKeyFormat(licenseKey) {
    if (!licenseKey || typeof licenseKey !== "string") {
      return false;
    }
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const simplePattern = /^[A-Z0-9]{16,}$/i;
    return uuidPattern.test(licenseKey) || simplePattern.test(licenseKey);
  }

  /**
   * Call authorization API
   * @param {string} licenseKey
   * @param {string} domain
   * @returns {Promise<LicenseResult>}
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
          product_id: "react-accessibility-tool",
        }),
      });

      if (!response.ok) {
        return createFailOpenResult(`API error: ${response.status}`);
      }

      const data = await response.json();
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
      return createFailOpenResult(`Network error: ${error.message}`);
    }
  }

  /**
   * Create fail-open result
   * @param {string} reason
   * @returns {LicenseResult}
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

  // Memory cache
  let cachedResult = null;

  /**
   * Main validation function
   * @param {Object} options
   * @param {string} [options.licenseKey]
   * @param {string} [options.domain]
   * @returns {Promise<LicenseResult>}
   */
  async function validateLicense(options = {}) {
    const { licenseKey, domain } = options;

    // No license provided - free mode
    if (!licenseKey) {
      return createFailOpenResult("No license key provided");
    }

    // Invalid format - allow but warn
    if (!isValidLicenseKeyFormat(licenseKey)) {
      return createFailOpenResult("Invalid license key format");
    }

    // Check cache
    if (cachedResult && cachedResult.fromCache === true) {
      const cacheAge = Date.now() - new Date(cachedResult.timestamp || 0).getTime();
      const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;
      if (cacheAge < ttlMs) {
        return { ...cachedResult, fromCache: true };
      }
    }

    const fileCache = readCache();
    if (fileCache) {
      cachedResult = fileCache;
      return { ...fileCache, fromCache: true };
    }

    // Domain required for API validation
    if (!domain) {
      return createFailOpenResult("Domain required for validation");
    }

    const result = await callLicenseApi(licenseKey, domain);
    cachedResult = result;
    writeCache(result);

    return result;
  }

  /**
   * Check if paid features are enabled
   * @returns {boolean}
   */
  function hasPaidFeatures() {
    if (!cachedResult) return false;
    const paidTiers = ["pro", "enterprise"];
    return paidTiers.includes(cachedResult.tier) && cachedResult.valid;
  }

  /**
   * Check if license is valid
   * @returns {boolean}
   */
  function isLicenseValid() {
    return cachedResult?.valid === true;
  }

  /**
   * Get current license info
   * @returns {LicenseResult|null}
   */
  function getLicenseInfo() {
    return cachedResult;
  }

  /**
   * Clear cached license result
   */
  function clearLicenseCache() {
    cachedResult = null;
    BrowserStorage.remove(CACHE_KEY);
  }

  /**
   * Get user-friendly status message
   * @param {LicenseResult} [result]
   * @returns {string}
   */
  function getLicenseStatusMessage(result = cachedResult) {
    if (!result) return "License status unknown - using free mode";
    if (result.valid) return `License valid (${result.tier} tier)`;
    if (result.expired) return "License expired - using free mode";
    if (!result.domainMatch) return "License domain mismatch - using free mode";
    if (result.error) return `License validation failed: ${result.error} - using free mode`;
    return "Invalid license - using free mode";
  }

  /**
   * Get the current domain
   * @returns {string}
   */
  function getCurrentDomain() {
    if (typeof window !== "undefined") {
      return window.location.hostname;
    }
    return "unknown";
  }

  /**
   * Auto-validate on page load (convenience method)
   * @param {Object} options
   * @returns {Promise<LicenseResult>}
   */
  async function autoValidate(options = {}) {
    const domain = options.domain || getCurrentDomain();
    return validateLicense({
      licenseKey: options.licenseKey || null,
      domain,
    });
  }

  // Export for different environments
  const LicenseValidate = {
    validate: validateLicense,
    autoValidate,
    hasPaidFeatures,
    isLicenseValid,
    getLicenseInfo,
    clearLicenseCache,
    getLicenseStatusMessage,
    getCurrentDomain,
    VERSION: "1.0.0",
  };

  // UMD export
  if (typeof module !== "undefined" && module.exports) {
    module.exports = LicenseValidate;
  } else if (typeof define === "function" && define.amd) {
    define(function () {
      return LicenseValidate;
    });
  } else {
    global.LicenseValidate = LicenseValidate;
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
