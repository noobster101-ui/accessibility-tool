/**
 * PDF Report Generator for Accessibility Scanner
 *
 * Cross-platform PDF generation for government compliance reports.
 * Compatible with bundlers (esbuild, tsup)
 *
 * Features:
 * - Audit-ready PDF reports
 * - WCAG 2.1 AA compliance summary
 * - License metadata embedding
 * - Grouped issues by WCAG principle
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Bundler-safe __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment detection
const isWindows = process.platform === "win32";

// Tool version - defined as constant for bundler compatibility
const TOOL_VERSION = "1.0.4";

/**
 * WCAG Principle definitions (bundler-safe)
 */
const WCAG_PRINCIPLES = {
  perceivable: {
    name: "Perceivable",
    description: "Information and user interface components must be presentable to users in ways they can perceive.",
    guidelines: ["1.1 Text Alternatives", "1.2 Time-based Media", "1.3 Adaptable", "1.4 Distinguishable"],
  },
  operable: {
    name: "Operable",
    description: "User interface components and navigation must be operable.",
    guidelines: ["2.1 Keyboard Accessible", "2.2 Enough Time", "2.3 Seizures", "2.4 Navigable"],
  },
  understandable: {
    name: "Understandable",
    description: "Information and the operation of user interface must be understandable.",
    guidelines: ["3.1 Readable", "3.2 Predictable", "3.3 Input Assistance"],
  },
  robust: {
    name: "Robust",
    description: "Content must be robust enough that it can be interpreted by a wide variety of user agents.",
    guidelines: ["4.1 Compatible"],
  },
};

/**
 * Map WCAG code to principle key
 */
function getPrincipleKey(wcag) {
  const prefix = wcag?.charAt(0) || "4";
  const map = { 1: "perceivable", 2: "operable", 3: "understandable" };
  return map[prefix] || "robust";
}

/**
 * Group issues by WCAG principle
 */
function groupIssuesByPrinciple(issues) {
  const grouped = {
    perceivable: { count: 0, issues: [] },
    operable: { count: 0, issues: [] },
    understandable: { count: 0, issues: [] },
    robust: { count: 0, issues: [] },
  };

  issues.forEach((issue) => {
    const principle = getPrincipleKey(issue.wcag);
    if (grouped[principle]) {
      grouped[principle].count++;
      grouped[principle].issues.push(issue);
    }
  });

  return grouped;
}

/**
 * Calculate compliance status
 */
function calculateCompliance(scanResult) {
  const total = scanResult?.totalIssues || 0;
  const errors = scanResult?.errors || 0;

  if (total === 0) {
    return { status: "PASS", score: 100, summary: "No issues detected." };
  }

  const errorRate = errors / total;

  if (errors === 0) {
    return { status: "PASS", score: 100, summary: "No critical barriers detected." };
  }
  if (errorRate <= 0.1) {
    return { status: "PASS", score: 90, summary: "Minor issues, generally compliant." };
  }
  if (errorRate <= 0.3) {
    return { status: "PARTIAL", score: 70, summary: "Several barriers require attention." };
  }
  return { status: "FAIL", score: 50, summary: "Significant accessibility barriers." };
}

/**
 * Format date for report
 */
function formatReportDate(dateStr) {
  const date = new Date(dateStr || Date.now());
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get output path (cross-platform)
 */
function getOutputPath(domain, extension) {
  const timestamp = new Date().toISOString().split("T")[0];
  const safeDomain = domain?.replace(/[^a-zA-Z0-9]/g, "_") || "report";
  return `accessibility-audit-${safeDomain}-${timestamp}.${extension}`;
}

/**
 * Generate PDF content (minimal PDF format for cross-platform compatibility)
 * Note: For production, consider using pdfkit or similar library
 */
function generatePdfContent(params) {
  const { scanResult, domain, compliance, grouped, licenseMetadata, version } = params;

  // Simple text-based PDF structure
  // For production, use a proper PDF library
  const lines = [
    `%PDF-1.4`,
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`,
    `4 0 obj << /Length ${estimatePdfLength(params)} >> stream`,
    `BT`,
    `/F1 20 Tf`,
    `50 750 Td`,
    `(ACCESSIBILITY COMPLIANCE AUDIT REPORT) Tj`,
    `/F1 12 Tf`,
    `0 -25 Td`,
    `(Domain: ${domain}) Tj`,
    `0 -15 Td`,
    `(Scan Date: ${formatReportDate(scanResult?.scannedAt)}) Tj`,
    `0 -15 Td`,
    `(Tool Version: ${version}) Tj`,
    `0 -30 Td`,
    `(==============================================) Tj`,
    `/F1 14 Tf`,
    `0 -25 Td`,
    `(WCAG 2.1 LEVEL AA COMPLIANCE) Tj`,
    `/F1 12 Tf`,
    `0 -20 Td`,
    `(Status: ${compliance.status} | Score: ${compliance.score}%) Tj`,
    `0 -15 Td`,
    `(${compliance.summary}) Tj`,
    generatePdfIssuesSection(grouped),
    generatePdfLicenseSection(licenseMetadata),
    `ET`,
    `endstream endobj`,
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
    `xref`,
    `0 6`,
    `0000000000 65535 f `,
    `0000000009 00000 n `,
    `0000000058 00000 n `,
    `0000000115 00000 n `,
    `0000000266 00000 n `,
    `0000002000 00000 n `,
    `trailer << /Size 6 /Root 1 0 R >>`,
    `startxref`,
    `%%EOF`,
  ];

  return lines.join("\n");
}

/**
 * Estimate PDF content length
 */
function estimatePdfLength(params) {
  const issueCount = params.scanResult?.issues?.length || 0;
  return 1000 + issueCount * 100;
}

/**
 * Generate issues section for PDF
 */
function generatePdfIssuesSection(grouped) {
  let yOffset = -30;
  let content = `0 ${yOffset} Td (ISSUES BY WCAG PRINCIPLE) Tj\n`;
  yOffset = -20;

  const principles = ["perceivable", "operable", "understandable", "robust"];

  principles.forEach((key) => {
    const principle = WCAG_PRINCIPLES[key];
    const data = grouped[key];

    if (data?.count > 0) {
      content += `0 ${yOffset} Td (${principle.name}: ${data.count} issue${data.count > 1 ? "s" : ""}) Tj\n`;
      yOffset = -15;

      data.issues.slice(0, 5).forEach((issue) => {
        const msg = `${issue.id}: ${issue.message.substring(0, 40)}...`;
        content += `15 ${yOffset} Td (${msg}) Tj\n`;
        yOffset = -12;
      });

      if (data.issues.length > 5) {
        content += `0 ${yOffset} Td (  ... and ${data.issues.length - 5} more) Tj\n`;
        yOffset = -15;
      }

      yOffset = -15;
    }
  });

  return content;
}

/**
 * Generate license section for PDF (PRO feature)
 */
function generatePdfLicenseSection(licenseMetadata) {
  if (!licenseMetadata) {
    return `0 -30 Td (DISCLAIMER: This report indicates WCAG readiness) Tj\n0 -12 Td (and does not replace a formal legal audit.) Tj`;
  }

  return (
    `0 -40 Td (LICENSE INFORMATION) Tj\n` +
    `0 -15 Td (Tier: ${licenseMetadata.tier?.toUpperCase() || "PRO"}) Tj\n` +
    `0 -15 Td (Domain: ${licenseMetadata.domain}) Tj\n` +
    `0 -15 Td (Authorized: ${formatReportDate(licenseMetadata.authorizedAt)}) Tj\n` +
    (licenseMetadata.expiresAt ? `0 -15 Td (Expires: ${formatReportDate(licenseMetadata.expiresAt)}) Tj\n` : ``) +
    `0 -30 Td (DISCLAIMER: This report indicates WCAG readiness) Tj\n` +
    `0 -12 Td (and does not replace a formal legal audit.) Tj`
  );
}

/**
 * Generate HTML audit report
 */
export function generateHtmlAuditReport({ scanResult, domain, licenseMetadata }) {
  const compliance = calculateCompliance(scanResult);
  const grouped = groupIssuesByPrinciple(scanResult?.issues || []);
  const scanDate = scanResult?.scannedAt || new Date().toISOString();

  const statusClass = compliance.status.toLowerCase();
  const severityColors = { error: "#dc3545", warning: "#ffc107" };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Compliance Audit - ${domain}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 40px; }
    .header { background: linear-gradient(135deg, #1a365d, #2c5282); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 20px; }
    .meta-item { background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; }
    .meta-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
    .compliance-badge { text-align: center; padding: 30px; border-radius: 12px; margin: 30px 0; }
    .compliance-badge.pass { background: #c6f6d5; border: 2px solid #38a169; }
    .compliance-badge.fail { background: #fed7d7; border: 2px solid #e53e3e; }
    .compliance-badge.partial { background: #fefcbf; border: 2px solid #d69e2e; }
    .status { font-size: 36px; font-weight: 700; }
    .pass .status { color: #22543d; }
    .fail .status { color: #742a2a; }
    .partial .status { color: #744210; }
    .score { font-size: 16px; margin-top: 8px; }
    .summary { font-size: 14px; margin-top: 8px; padding: 12px; background: rgba(255,255,255,0.6); border-radius: 6px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 25px 0; }
    .stat-card { background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
    .stat-number { font-size: 28px; font-weight: 700; }
    .stat-number.errors { color: #e53e3e; }
    .stat-number.warnings { color: #d69e2e; }
    .stat-number.total { color: #3182ce; }
    .stat-label { font-size: 12px; color: #718096; margin-top: 4px; }
    .principle-section { margin: 25px 0; }
    .principle-header { background: #edf2f7; padding: 12px 18px; border-radius: 8px; font-size: 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
    .principle-count { background: #4a5568; color: white; padding: 2px 12px; border-radius: 20px; font-size: 12px; }
    .issue-list { list-style: none; padding: 0; margin: 0; }
    .issue-item { padding: 12px 18px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
    .issue-item:last-child { border-bottom: none; }
    .issue-main { flex: 1; }
    .issue-id { font-weight: 600; color: #2d3748; font-size: 14px; }
    .issue-wcag { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px; }
    .issue-message { color: #4a5568; font-size: 13px; margin-top: 4px; }
    .severity { font-size: 11px; padding: 4px 10px; border-radius: 4px; font-weight: 600; }
    .severity.error { background: #fed7d7; color: #c53030; }
    .severity.warning { background: #fefcbf; color: #975a16; }
    .license-info { background: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .license-info h3 { color: #22543d; margin-bottom: 10px; font-size: 16px; }
    .license-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #9ae6b4; font-size: 13px; }
    .license-row:last-child { border-bottom: none; }
    .disclaimer { background: #faf5ff; border-left: 4px solid #805ad5; padding: 18px; margin-top: 30px; border-radius: 0 8px 8px 0; font-size: 13px; color: #553c9a; }
    .disclaimer strong { display: block; margin-bottom: 6px; }
    .footer { text-align: center; margin-top: 35px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Accessibility Compliance Audit Report</h1>
    <div class="header-meta">
      <div class="meta-item">
        <div class="meta-label">Domain</div>
        <div class="meta-value">${domain}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Scan Date</div>
        <div class="meta-value">${formatReportDate(scanDate)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Tool Version</div>
        <div class="meta-value">v${TOOL_VERSION}</div>
      </div>
    </div>
  </div>

  <div class="compliance-badge ${statusClass}">
    <div class="status">${compliance.status}</div>
    <div class="score">Compliance Score: ${compliance.score}%</div>
    <div class="summary">${compliance.summary}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-number total">${scanResult?.totalIssues || 0}</div>
      <div class="stat-label">Total Issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-number errors">${scanResult?.errors || 0}</div>
      <div class="stat-label">Critical Errors</div>
    </div>
    <div class="stat-card">
      <div class="stat-number warnings">${scanResult?.warnings || 0}</div>
      <div class="stat-label">Warnings</div>
    </div>
  </div>

  ${generateHtmlPrinciplesSection(grouped)}

  ${licenseMetadata ? generateHtmlLicenseSection(licenseMetadata) : ""}

  <div class="disclaimer">
    <strong>Disclaimer</strong>
    This report indicates WCAG readiness and does not replace a formal legal audit.
    Results are based on automated scanning and should be validated by a qualified accessibility professional.
  </div>

  <div class="footer">
    <p>Generated by Accessibility Scanner v${TOOL_VERSION}</p>
    <p>WCAG 2.1 Level AA Compliance Report</p>
  </div>
</body>
</html>`;
}

/**
 * Generate principles section for HTML
 */
function generateHtmlPrinciplesSection(grouped) {
  const principles = ["perceivable", "operable", "understandable", "robust"];
  let html = "";

  principles.forEach((key) => {
    const principle = WCAG_PRINCIPLES[key];
    const data = grouped[key];

    if (data?.count > 0) {
      html += `
      <div class="principle-section">
        <div class="principle-header">
          <span>${principle.name}</span>
          <span class="principle-count">${data.count} ${data.count === 1 ? "issue" : "issues"}</span>
        </div>
        <ul class="issue-list">
          ${data.issues
            .map(
              (issue) => `
          <li class="issue-item">
            <div class="issue-main">
              <span class="issue-id">${issue.id}</span>
              <span class="issue-wcag">WCAG ${issue.wcag}</span>
              <div class="issue-message">${issue.message}</div>
            </div>
            <span class="severity ${issue.severity}">${issue.severity.toUpperCase()}</span>
          </li>
          `
            )
            .join("")}
        </ul>
      </div>`;
    }
  });

  return html;
}

/**
 * Generate license section for HTML (PRO feature)
 */
function generateHtmlLicenseSection(metadata) {
  const expiryText = metadata.expiresAt ? formatReportDate(metadata.expiresAt) : "No expiration";

  return `
  <div class="license-info">
    <h3>License Information (PRO)</h3>
    <div class="license-row">
      <span>License Tier</span>
      <span>${metadata.tier?.toUpperCase() || "PRO"}</span>
    </div>
    <div class="license-row">
      <span>Licensed Domain</span>
      <span>${metadata.domain}</span>
    </div>
    <div class="license-row">
      <span>Authorized Date</span>
      <span>${formatReportDate(metadata.authorizedAt)}</span>
    </div>
    <div class="license-row">
      <span>Expiration</span>
      <span>${expiryText}</span>
    </div>
  </div>`;
}

/**
 * Generate PDF audit report
 *
 * @param {Object} options - Report options
 * @param {Object} options.scanResult - Scan results
 * @param {string} options.domain - Domain name
 * @param {Object} options.licenseMetadata - License metadata (PRO feature)
 * @returns {Promise<Object>} Generation result
 */
export async function generateAuditPdf({ scanResult, domain, licenseMetadata }) {
  try {
    const compliance = calculateCompliance(scanResult);
    const grouped = groupIssuesByPrinciple(scanResult?.issues || []);
    const outputPath = getOutputPath(domain, "pdf");

    const pdfContent = generatePdfContent({
      scanResult,
      domain,
      compliance,
      grouped,
      licenseMetadata,
      version: TOOL_VERSION,
    });

    writeFileSync(outputPath, pdfContent);

    return {
      success: true,
      filename: outputPath,
      compliance: compliance.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get tool version (bundler-safe)
 */
export function getVersion() {
  return TOOL_VERSION;
}

export default {
  generateAuditPdf,
  generateHtmlAuditReport,
  getVersion,
};
