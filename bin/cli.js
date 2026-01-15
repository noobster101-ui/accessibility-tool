#!/usr/bin/env node

/**
 * Accessibility Scanner CLI
 *
 * Cross-platform CLI for web accessibility compliance.
 * Node.js 18+ - Works on macOS, Linux, Windows
 * Compatible with bundlers (esbuild, tsup, vite)
 *
 * Usage:
 *   node bin/cli.js --url=<url> --domain=<domain>
 *   node bin/cli.js --url=<url> --domain=<domain> --export=pdf
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Bundler-safe __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment detection for cross-platform paths
const isWindows = process.platform === "win32";

// Import path utilities - cross-platform safe
const resolvePath = (...segments) => join(__dirname, ...segments);

// Dynamic imports for bundler compatibility
let authorizeUsage, hasPaidFeatures, isProOrHigher, getAuthStatusMessage, getUsageStats, clearAuthCache, getLicenseMetadata;

try {
  const authPath = resolvePath("..", "authorization.js");
  const auth = await import(authPath);
  authorizeUsage = auth.authorizeUsage;
  hasPaidFeatures = auth.hasPaidFeatures;
  isProOrHigher = auth.isProOrHigher;
  getAuthStatusMessage = auth.getAuthStatusMessage;
  getUsageStats = auth.getUsageStats;
  clearAuthCache = auth.clearAuthCache;
  getLicenseMetadata = auth.getLicenseMetadata;
} catch (error) {
  console.error("Failed to load authorization module:", error.message);
  process.exit(1);
}

let generateAuditPdf, generateHtmlAuditReport, getVersion;

try {
  const pdfPath = resolvePath("..", "pdf-report.js");
  const pdf = await import(pdfPath);
  generateAuditPdf = pdf.generateAuditPdf;
  generateHtmlAuditReport = pdf.generateHtmlAuditReport;
  getVersion = pdf.getVersion;
} catch (error) {
  console.error("Failed to load PDF module:", error.message);
  process.exit(1);
}

// ============================================
// CLI Configuration
// ============================================

const CLI_CONFIG = {
  name: "Accessibility Scanner",
  version: getVersion?.() || "1.0.0",
  supportedExports: ["terminal", "json", "html", "pdf"],
};

// ============================================
// CLI Argument Parsing (cross-platform)
// ============================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: null,
    domain: null,
    export: null,
    help: false,
    reset: false,
    verbose: false,
  };

  for (const arg of args) {
    const normalized = arg.toLowerCase();

    if (normalized === "--help" || normalized === "-h") {
      options.help = true;
    } else if (normalized === "--reset") {
      options.reset = true;
    } else if (normalized === "--verbose" || normalized === "-v") {
      options.verbose = true;
    } else if (arg.startsWith("--url=")) {
      options.url = arg.split("=")[1];
    } else if (arg.startsWith("--domain=")) {
      options.domain = arg.split("=")[1];
    } else if (arg.startsWith("--export=")) {
      options.export = arg.split("=")[1].toLowerCase();
    }
  }

  return options;
}

// ============================================
// Scanner Engine
// ============================================

async function scanWebsite(url, domain, verbose = false) {
  if (verbose) {
    console.log(`[DEBUG] Scanning: ${url} (${domain})`);
  }

  // Simulated accessibility issues for demonstration
  const issues = [
    {
      id: "ARIA001",
      severity: "error",
      category: "ARIA",
      wcag: "4.1.2",
      message: "Missing ARIA label on button",
      element: '<button class="btn-submit">',
      suggestion: "Add aria-label or aria-labelledby attribute",
    },
    {
      id: "IMG002",
      severity: "error",
      category: "Images",
      wcag: "1.1.1",
      message: "Missing alt attribute on images",
      element: '<img src="hero.jpg">',
      count: 3,
    },
    {
      id: "CONTRAST001",
      severity: "warning",
      category: "Color",
      wcag: "1.4.3",
      message: "Low color contrast detected (3.2:1)",
      element: ".text-muted",
      suggestion: "Increase to 4.5:1 minimum",
    },
    {
      id: "HEADING001",
      severity: "warning",
      category: "Headings",
      wcag: "1.3.1",
      message: "Heading levels skipped (h1 → h3)",
      element: "h1 → h3",
      suggestion: "Use sequential levels",
    },
    {
      id: "FORM001",
      severity: "error",
      category: "Forms",
      wcag: "1.3.1",
      message: "Form input missing label",
      element: '<input type="email">',
      suggestion: "Associate label using for/id",
    },
    {
      id: "FOCUS001",
      severity: "warning",
      category: "Keyboard",
      wcag: "2.4.7",
      message: "Insufficient focus indicator contrast",
      element: ":focus",
      suggestion: "Use 3:1 contrast ratio for focus",
    },
    {
      id: "LINK001",
      severity: "warning",
      category: "Links",
      wcag: "2.4.4",
      message: "Link text not descriptive",
      element: '<a href="#">Click here</a>',
      suggestion: "Use descriptive link text",
    },
    {
      id: "TITLE001",
      severity: "error",
      category: "Metadata",
      wcag: "2.4.2",
      message: "Page title missing or empty",
      element: "<title></title>",
      suggestion: "Add descriptive page title",
    },
  ];

  return {
    url,
    scannedAt: new Date().toISOString(),
    totalIssues: issues.length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    issues,
  };
}

// ============================================
// Report Export
// ============================================

async function exportReport(scanResult, format, domain, authResult) {
  const timestamp = new Date().toISOString().split("T")[0];
  const safeDomain = domain?.replace(/[^a-zA-Z0-9]/g, "_") || "report";
  const filename = `a11y-report-${safeDomain}-${timestamp}`;

  // PDF requires PRO license
  if (format === "pdf") {
    if (!isProOrHigher(authResult)) {
      return {
        error: "PDF audit report requires a PRO license",
        locked: true,
        upgradeTip: "Upgrade to PRO for audit-ready PDF reports",
      };
    }

    const licenseMetadata = getLicenseMetadata(authResult);
    const result = await generateAuditPdf({
      scanResult,
      domain,
      licenseMetadata,
    });

    if (result.success) {
      return {
        type: "pdf",
        filename: result.filename,
        compliance: result.compliance,
        licenseMetadata,
      };
    }

    return { error: result.error };
  }

  // HTML/JSON require basic paid license
  if (format === "html" || format === "json") {
    if (!hasPaidFeatures(authResult)) {
      return {
        error: `License required to export ${format.toUpperCase()} reports`,
        locked: true,
        upgradeTip: "Upgrade your license to export reports",
      };
    }

    const licenseMetadata = getLicenseMetadata(authResult);

    if (format === "json") {
      const exportData = {
        scanResult,
        licenseMetadata,
        exportedAt: new Date().toISOString(),
        toolVersion: CLI_CONFIG.version,
      };
      return {
        type: "json",
        filename: `${filename}.json`,
        content: JSON.stringify(exportData, null, 2),
      };
    }

    const html = generateHtmlAuditReport({
      scanResult,
      domain,
      licenseMetadata,
    });
    return {
      type: "html",
      filename: `${filename}.html`,
      content: html,
    };
  }

  return { error: "Unsupported format" };
}

// ============================================
// Display Functions
// ============================================

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          ${CLI_CONFIG.name} v${CLI_CONFIG.version}                    ║
║          Cross-Platform Accessibility Scanner                 ║
╠═══════════════════════════════════════════════════════════════╣
║  FREE MODE                      PRO/ENTERPRISE (License)      ║
║  ─────────────                  ────────────────────────────  ║
║  ✓ Accessibility scans          ✓ Export HTML reports         ║
║  ✓ Terminal output              ✓ Export JSON reports         ║
║  ✓ WCAG Level A checks          ✓ WCAG Level AA checks        ║
║  ✓ 8 issue categories           ✓ Compliance PASS/FAIL        ║
║                                 ✓ PDF audit reports (PRO)     ║
╚═══════════════════════════════════════════════════════════════╝

USAGE:
  ${process.argv[0]} ${process.argv[1]} --url=<url> --domain=<domain> [options]

OPTIONS:
  --url=<url>           URL to scan (required)
  --domain=<domain>     Domain for license authorization
  --export=<format>     Export: terminal (default), json, html, pdf
  --reset               Clear license cache and reset
  --verbose, -v         Enable verbose output
  --help, -h            Show this help

ENVIRONMENT:
  ACCESS_LICENSE_KEY    Your license key

EXAMPLES:
  # Free scan (no license)
  ${process.argv[1]} --url=https://example.com --domain=example.com

  # With license (unlocks paid features)
  ACCESS_LICENSE_KEY=pk_live_xxx ${process.argv[1]} \\
    --url=https://example.edu --domain=example.edu \\
    --export=html

  # PRO: Generate PDF audit report
  ACCESS_LICENSE_KEY=pk_live_xxx ${process.argv[1]} \\
    --url=https://example.edu --domain=example.edu \\
    --export=pdf

SYSTEM REQUIREMENTS:
  - Node.js 18+
  - macOS, Linux, or Windows

EXIT CODES:
  0 - Scan completed successfully
  1 - Error (missing arguments, network error, etc.)
`);
}

function printBanner() {
  console.log(`╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║          ${CLI_CONFIG.name} v${CLI_CONFIG.version}                    ║`);
  console.log(`║          Cross-Platform Accessibility Scanner                 ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝`);
}

function printScanResults(scanResult) {
  console.log(`\n📊 Scan Results:`);
  console.log(`   Total Issues: ${scanResult.totalIssues}`);
  console.log(`   🔴 Errors: ${scanResult.errors}`);
  console.log(`   🟡 Warnings: ${scanResult.warnings}`);

  console.log(`\n📝 Issues Found:`);
  scanResult.issues.forEach((issue) => {
    const icon = issue.severity === "error" ? "🔴" : "🟡";
    console.log(`   ${icon} ${issue.id} [WCAG ${issue.wcag}]`);
    console.log(`      ${issue.message}`);
    console.log(`      Element: ${issue.element}`);
    if (issue.suggestion) {
      console.log(`      💡 Fix: ${issue.suggestion}`);
    }
    console.log(``);
  });
}

function printComplianceStatus(scanResult, authResult) {
  console.log(`═════════════════════════════════════════════════════════`);
  console.log(`WCAG COMPLIANCE STATUS`);
  console.log(`═════════════════════════════════════════════════════════`);

  if (hasPaidFeatures(authResult)) {
    const errorRate = scanResult.errors / scanResult.totalIssues;
    let level, message;

    if (scanResult.errors === 0) {
      level = "AAA";
      message = "No critical barriers - excellent accessibility!";
    } else if (errorRate < 0.2) {
      level = "AA";
      message = "Mostly compliant - minor issues to fix.";
    } else if (errorRate < 0.5) {
      level = "A";
      message = "Partially compliant - several issues need attention.";
    } else {
      level = "FAIL";
      message = "Not compliant - critical barriers detected.";
    }

    console.log(`\n✅ WCAG 2.1 Level ${level}`);
    console.log(`   ${message}`);
  } else {
    console.log(`\n⚠️  COMPLIANCE STATUS: LOCKED`);
    console.log(`   Upgrade your license to unlock compliance analysis.`);
  }
  console.log(``);
}

function printExportResult(exportResult) {
  if (exportResult.locked) {
    console.log(`⚠️  ${exportResult.error}`);
    if (exportResult.upgradeTip) {
      console.log(`   💡 ${exportResult.upgradeTip}\n`);
    }
    return;
  }

  console.log(`✅ Report exported: ${exportResult.filename}`);
  console.log(`   Type: ${exportResult.type.toUpperCase()}`);

  if (exportResult.type === "pdf") {
    console.log(`   Compliance: ${exportResult.compliance}`);
    console.log(`\n   📄 PDF includes:`);
    console.log(`   - Domain and scan date`);
    console.log(`   - WCAG 2.1 AA coverage summary`);
    console.log(`   - Issues grouped by WCAG principle`);
    console.log(`   - License metadata (PRO)`);
    console.log(`   - Disclaimer (not a legal audit)\n`);
  } else {
    console.log(`   Size: ${exportResult.content?.length || 0} bytes\n`);
  }
}

function printSummary(authResult) {
  console.log(`═════════════════════════════════════════════════════════`);
  console.log(`SUMMARY`);
  console.log(`═════════════════════════════════════════════════════════`);

  if (isProOrHigher(authResult)) {
    console.log(`\n✅ PRO LICENSE ACTIVE`);
    console.log(`   Tier: ${authResult.tier?.toUpperCase()}`);
    console.log(`   Features: All unlocked including PDF reports`);
  } else if (hasPaidFeatures(authResult)) {
    console.log(`\n✅ LICENSE ACTIVE (Basic)`);
    console.log(`   Tier: ${authResult.tier?.toUpperCase()}`);
    console.log(`   Features: HTML/JSON export, Compliance status`);
    console.log(`   Upgrade: PRO for PDF audit reports\n`);
  } else {
    console.log(`\n🔓 FREE MODE ACTIVE`);
    console.log(`   ┌─────────────────────────────────────────┐`);
    console.log(`   │ Feature                    │ Status     │`);
    console.log(`   ├─────────────────────────────────────────┤`);
    console.log(`   │ Accessibility Scan         │ ✓ Enabled  │`);
    console.log(`   │ Terminal Output            │ ✓ Enabled  │`);
    console.log(`   │ WCAG Level A Checks        │ ✓ Enabled  │`);
    console.log(`   │ Export Reports (HTML/JSON) │ ✗ Locked   │`);
    console.log(`   │ PDF Audit Report           │ ✗ Locked   │`);
    console.log(`   │ Compliance PASS/FAIL       │ ✗ Locked   │`);
    console.log(`   └─────────────────────────────────────────┘`);
    console.log(`\n   Get a license to unlock all features!\n`);
  }

  console.log(`📁 Cache: .tool-license-cache.json (24h TTL)`);
  console.log(`📊 Usage: .tool-usage.json\n`);
  console.log(`✨ Scan complete!\n`);
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  const options = parseArgs();
  const licenseKey = process.env.ACCESS_LICENSE_KEY || null;

  // Handle --help
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Handle --reset
  if (options.reset) {
    console.log(`🔄 Resetting license cache...`);
    clearAuthCache();
    console.log(`✅ Cache cleared.\n`);
    process.exit(0);
  }

  // Validate required arguments
  if (!options.url) {
    console.error(`❌ Error: --url is required\n`);
    console.error(`   Use --help for usage information\n`);
    process.exit(1);
  }

  if (!options.domain) {
    console.error(`❌ Error: --domain is required\n`);
    console.error(`   Use --help for usage information\n`);
    process.exit(1);
  }

  // Print banner
  printBanner();

  // ========================================
  // Authorization Check
  // ========================================

  console.log(`\n🔐 Authorizing usage...`);

  let authResult;
  try {
    authResult = await authorizeUsage({
      licenseKey,
      domain: options.domain,
    });
  } catch (error) {
    console.log(`   ⚠️  Authorization check failed - continuing in free mode`);
    authResult = {
      valid: false,
      authorized: false,
      tier: "free",
      message: `Authorization error: ${error.message}`,
    };
  }

  console.log(`   Status: ${getAuthStatusMessage(authResult)}`);

  if (authResult.authorized) {
    console.log(`   Tier: ${authResult.tier?.toUpperCase()}`);
    if (authResult.expiresAt) {
      console.log(`   Expires: ${new Date(authResult.expiresAt).toLocaleDateString()}`);
    }
    if (isProOrHigher(authResult)) {
      console.log(`   ✅ PRO features unlocked`);
    }

    if (options.verbose) {
      const stats = getUsageStats();
      if (stats) {
        console.log(`   First used: ${new Date(stats.firstUsed).toLocaleDateString()}`);
      }
    }
  }

  // ========================================
  // Run Scan (ALWAYS ALLOWED)
  // ========================================

  console.log(`\n${`═`.repeat(65)}`);
  console.log(`SCANNING`);
  console.log(`═`.repeat(65));

  let scanResult;
  try {
    scanResult = await scanWebsite(options.url, options.domain, options.verbose);
  } catch (error) {
    console.error(`\n❌ Scan failed: ${error.message}`);
    process.exit(1);
  }

  // Display results
  printScanResults(scanResult);

  // Compliance status
  printComplianceStatus(scanResult, authResult);

  // ========================================
  // Report Export
  // ========================================

  if (options.export && options.export !== "terminal") {
    console.log(`═`.repeat(65));
    console.log(`REPORT EXPORT`);
    console.log(`═`.repeat(65));

    const exportResult = await exportReport(scanResult, options.export, options.domain, authResult);
    printExportResult(exportResult);
  }

  // Summary
  printSummary(authResult);
}

// Run CLI
main().catch((error) => {
  console.error(`\n❌ Error: ${error.message}`);
  process.exit(1);
});
