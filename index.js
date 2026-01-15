export { default } from "./AccessibilityTool.js";

// ============================================================================
// License Validation Exports
// Supports both legacy (license.js) and new (authorization.js) APIs
// ============================================================================

// Legacy license validation exports
export {
  validateLicense,
  hasPaidFeatures as hasPaidFeaturesLegacy,
  isLicenseValid,
  getLicenseInfo,
  clearLicenseCache,
  getLicenseStatusMessage,
} from "./license.js";

// NPM Package Authorization exports (unified API)
export {
  authorizeUsage,
  hasPaidFeatures,
  isProOrHigher,
  isFullyAuthorized,
  getAuthStatusMessage,
  clearAuthCache,
  getUsageStats,
  getConfig,
  getLicenseMetadata,
} from "./authorization.js";

// PDF Report Generation exports (PRO feature)
export { generateAuditPdf, generateHtmlAuditReport, getVersion } from "./pdf-report.js";

// ============================================================================
// Unified API Re-exports for backward compatibility
// ============================================================================

// Export license validation functions from authorization.js as well
// This provides a single source of truth while maintaining compatibility
export { authorizeUsage as authorizeLicense, isFullyAuthorized as isAuthorized } from "./authorization.js";
