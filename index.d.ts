import * as React from "react";

// ============================================================================
// Accessibility Tool Component Types
// ============================================================================

export interface AccessibilityToolProps {
  /** Position from right edge */
  right?: string;
  /** Position from bottom edge */
  bottom?: string;
  /** Background color */
  bgColor?: string;
  /** Text color */
  textColor?: string;
}

export default function AccessibilityTool(props: AccessibilityToolProps): null;

// ============================================================================
// License Validation Types
// ============================================================================

export type LicenseTier = "free" | "pro" | "enterprise";

export interface LicenseResult {
  /** Whether the license is valid */
  valid: boolean;
  /** Whether the license has expired */
  expired: boolean;
  /** Whether the domain matches */
  domainMatch: boolean;
  /** License tier */
  tier: LicenseTier;
  /** License expiration date */
  expiresAt: Date | null;
  /** Error message if validation failed */
  error: string | null;
  /** Whether result came from cache */
  fromCache: boolean;
}

export interface ValidateLicenseOptions {
  /** License key (optional) */
  licenseKey?: string;
  /** Domain to validate (optional) */
  domain?: string;
}

// ============================================================================
// Authorization Types
// ============================================================================

export interface AuthorizationResult {
  /** Whether license is valid */
  valid: boolean;
  /** Whether usage is authorized */
  authorized: boolean;
  /** License tier */
  tier: LicenseTier;
  /** Expiration date */
  expiresAt: Date | null;
  /** Domain */
  domain: string | null;
  /** Authorization timestamp */
  authorizedAt: string | null;
  /** Status message */
  message: string;
  /** Error details */
  error?: string;
  /** Whether from cache */
  fromCache: boolean;
}

export interface AuthorizeUsageOptions {
  /** License key (optional) */
  licenseKey?: string;
  /** Domain to authorize (optional) */
  domain?: string;
}

export interface UsageStats {
  /** First usage timestamp */
  firstUsed: string;
  /** Last usage timestamp */
  lastUsed?: string;
  /** Package name */
  packageName?: string;
  /** Package version */
  packageVersion?: string;
  /** Domain */
  domain?: string;
  /** Usage entries */
  uses: Array<{
    timestamp: string;
    domain: string;
  }>;
}

export interface LicenseMetadata {
  /** License tier */
  tier: string;
  /** Is licensed */
  licensed: boolean;
  /** Licensed domain */
  domain: string;
  /** Authorization timestamp */
  authorizedAt: string;
  /** Expiration date */
  expiresAt: Date | null;
}

export interface Config {
  LICENSE_API_URL: string;
  CACHE_TTL_HOURS: number;
  MAX_USAGE_ENTRIES: number;
  PAID_TIERS: string[];
}

export interface PackageInfo {
  name: string;
  version: string;
}

// ============================================================================
// PDF Report Types
// ============================================================================

export interface ScanResult {
  /** Scanned URL */
  url: string;
  /** Scan timestamp */
  scannedAt: string;
  /** Total issues count */
  totalIssues: number;
  /** Errors count */
  errors: number;
  /** Warnings count */
  warnings: number;
  /** Issues list */
  issues: AccessibilityIssue[];
}

export interface AccessibilityIssue {
  /** Issue ID */
  id: string;
  /** Severity level */
  severity: "error" | "warning" | "info";
  /** Issue category */
  category: string;
  /** WCAG criterion */
  wcag: string;
  /** Issue description */
  message: string;
  /** Element HTML */
  element: string;
  /** Suggestion for fix */
  suggestion?: string;
  /** Count of occurrences */
  count?: number;
}

export interface ComplianceStatus {
  /** Status: PASS, FAIL, or PARTIAL */
  status: "PASS" | "FAIL" | "PARTIAL";
  /** Compliance score (0-100) */
  score: number;
  /** Summary description */
  summary: string;
}

export interface GeneratePdfOptions {
  /** Scan results */
  scanResult: ScanResult;
  /** Domain name */
  domain: string;
  /** License metadata (PRO feature) */
  licenseMetadata?: LicenseMetadata | null;
}

export interface GeneratePdfResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Output filename */
  filename?: string;
  /** Compliance status */
  compliance?: string;
  /** Error message */
  error?: string;
}

export interface GenerateHtmlOptions {
  /** Scan results */
  scanResult: ScanResult;
  /** Domain name */
  domain: string;
  /** License metadata (PRO feature) */
  licenseMetadata?: LicenseMetadata | null;
}

export interface GenerateHtmlResult {
  /** HTML content */
  html: string;
}

// ============================================================================
// CLI Types
// ============================================================================

export interface CLIOptions {
  /** URL to scan */
  url: string | null;
  /** Domain for license */
  domain: string | null;
  /** Export format */
  export: string | null;
  /** Show help */
  help: boolean;
  /** Reset cache */
  reset: boolean;
  /** Verbose output */
  verbose: boolean;
}

// ============================================================================
// Export Functions
// ============================================================================

// License Validation Exports
export declare function validateLicense(options?: ValidateLicenseOptions): Promise<LicenseResult>;

export declare function hasPaidFeatures(): boolean;

export declare function isLicenseValid(): boolean;

export declare function getLicenseInfo(): LicenseResult | null;

export declare function clearLicenseCache(): void;

export declare function getLicenseStatusMessage(result?: LicenseResult): string;

// Authorization Exports
export declare function authorizeUsage(options?: AuthorizeUsageOptions): Promise<AuthorizationResult>;

export declare function hasPaidFeatures(authResult?: AuthorizationResult): boolean;

export declare function isProOrHigher(authResult?: AuthorizationResult): boolean;

export declare function isFullyAuthorized(authResult?: AuthorizationResult): boolean;

export declare function getAuthStatusMessage(authResult?: AuthorizationResult): string;

export declare function clearAuthCache(): void;

export declare function getUsageStats(): UsageStats | null;

export declare function getConfig(): Config;

export declare function getLicenseMetadata(authResult?: AuthorizationResult): LicenseMetadata | null;

// PDF Report Exports
export declare function generateAuditPdf(options: GeneratePdfOptions): Promise<GeneratePdfResult>;

export declare function generateHtmlAuditReport(options: GenerateHtmlOptions): string;

export declare function getVersion(): string;
