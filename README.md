# Accessibility Tool (React)

A plug-and-play accessibility toolbar for React applications that allows users to customize visual and reading preferences in real time.

This tool improves usability and accessibility without changing your existing layout or application structure.

---

## Features

• Floating accessibility button
• Sidebar with multiple accessibility controls
• Zero configuration
• Lightweight and dependency-free
• Works with any React app
• WCAG-friendly enhancements

---

## Installation

Using npm:

```
npm install react-accessibility-tool
```

Using yarn:

```
yarn add react-accessibility-tool
```

---

## Usage

### 1. Import the component and CSS

```js
import AccessibilityTool from "react-accessibility-tool";
import "react-accessibility-tool/accessibility-tool.css";
```

### 2. Use the component in your app

```jsx
function App() {
  return (
    <>
      <AccessibilityTool right="20px" bottom="20px" bgColor="#000" textColor="#fff" />
      {/* Your application content */}
    </>
  );
}
```

The accessibility toolbar automatically attaches to the document body.
or
Add id="a1s-root" to div on which it should apply only.

```jsx
function App() {
  return (
    <>
      <div className="App" id="als-root">
        ...
        {content}
      </div>
      <AccessibilityTool right="20px" bottom="20px" bgColor="#000" textColor="#fff" />
      {/* Your application content */}
    </>
  );
}
```

---

## Props

right
• Type: string
• Description: Distance from the right side (e.g. `20px`, `1rem`)

left
• Type: string
• Description: Distance from the left side

top
• Type: string
• Description: Distance from the top

bottom
• Type: string
• Description: Distance from the bottom

bgColor
• Type: string
• Description: Background color of the floating button

textColor
• Type: string
• Description: Text color of the floating button

Note: Use either left or right, and either top or bottom.

---

## Accessibility Tools Included

### Zoom Controls

• Zoom In (up to 5 levels)
• Zoom Out
• Preserves original font sizes

---

### Visual Adjustments

• High Contrast Mode
• Invert Colors
• Saturation Control
– Low saturation
– High saturation
– Desaturated (grayscale)

---

### Text Controls

• Text Alignment
– Left
– Center
– Right
– Justify
• Line Height Adjustment
• Text Spacing (letter and word spacing)

---

### Readability Enhancements

• Dyslexia-friendly font
• Highlight all links

---

### Cursor & Motion

• Cursor size options
– Default
– Medium
– Large
• Pause animations

---

### Content Visibility

• Hide images

---

### Reset

• Reset all settings to default with a single click

---

## Scanner Features

The CLI scanner checks websites for accessibility issues. It performs 11 automated checks covering common WCAG violations.

### Current Scanner Checks (11 Checks)

| #   | Feature              | WCAG         | What It Does                                             |
| --- | -------------------- | ------------ | -------------------------------------------------------- |
| 1   | ARIA Validation      | 4.1.2        | Checks if ARIA labels and roles are used correctly       |
| 2   | Alt Text Detection   | 1.1.1        | Finds images missing alt text                            |
| 3   | Color Contrast       | 1.4.3        | Checks text vs background contrast ratio (4.5:1 minimum) |
| 4   | Heading Structure    | 1.3.1        | Ensures headings go in order (h1 → h2 → h3)              |
| 5   | Form Labels          | 1.3.1, 4.1.2 | Checks inputs have associated labels                     |
| 6   | Link Text            | 2.4.4        | Finds links with vague text like "click here"            |
| 7   | Keyboard Navigation  | 2.1.1        | Checks all interactive elements are keyboard accessible  |
| 8   | Focus Indicators     | 2.4.7        | Verifies visible focus states exist                      |
| 9   | Table Headers        | 1.3.1        | Checks data tables have proper th elements               |
| 10  | Language Declaration | 3.1.1        | Verifies html lang attribute is set                      |
| 11  | Duplicate IDs        | 4.1.1        | Finds duplicate id attributes (breaks ARIA)              |

### WCAG Compliance Levels

- **Level A** - Must have (critical issues)
- **Level AA** - Should have (most government requirement)
- **Level AAA** - Nice to have

Most government sites require **WCAG 2.1 Level AA**.

### Scanner Output

The scanner outputs:

- Total issues count
- Errors (critical issues)
- Warnings (minor issues)
- Detailed suggestions for each issue

Paid features unlock:

- Export HTML/JSON/PDF reports
- WCAG compliance status (PASS/FAIL)
- Compliance level (AAA, AA, A)

---

## Technical Notes

• Uses React `useEffect` to initialize once
• Maintains internal state for all controls
• Uses CSS classes for performance
• Cleans up styles on reset
• Does not pollute the global scope

---

## Accessibility Disclaimer

This tool enhances accessibility but does not replace proper semantic HTML, ARIA roles, or accessibility-first design practices.
It is intended as a user-controlled accessibility assistant.

---

## License

### Open Source (Free Mode)

The package is MIT licensed and free to use with basic features:

- Accessibility toolbar with all visual adjustments
- Real-time user customization
- No license required

### Commercial License (Paid Features)

Paid features require a license issued directly by us:

| Feature                | Free | Pro | Enterprise |
| ---------------------- | ---- | --- | ---------- |
| Toolbar & Visual Tools | ✅   | ✅  | ✅         |
| Basic Scanning         | ✅   | ✅  | ✅         |
| Report Export          | ❌   | ✅  | ✅         |
| Compliance Status      | ❌   | ❌  | ✅         |
| Priority Support       | ❌   | ❌  | ✅         |

### License Configuration

#### Environment Variable

Set your license key via environment variable:

```bash
ACCESS_LICENSE_KEY=pk_live_your_license_key
```

#### CLI Usage

The CLI tool is available as `a11y-scan` after installing the package globally or locally.

```bash
# Free scan (no license)
a11y-scan --url=https://example.com --domain=example.com

# With license (unlocks paid features)
ACCESS_LICENSE_KEY=pk_live_xxx a11y-scan \
  --url=https://example.edu --domain=example.edu \
  --export=html

# PRO: Generate PDF audit report
ACCESS_LICENSE_KEY=pk_live_xxx a11y-scan \
  --url=https://example.edu --domain=example.edu \
  --export=pdf
```

The CLI supports the following options:

| Option              | Description                                        |
| ------------------- | -------------------------------------------------- |
| `--url=<url>`       | URL to scan (required)                             |
| `--domain=<domain>` | Domain for license authorization (required)        |
| `--export=<format>` | Export format: terminal (default), json, html, pdf |
| `--help`            | Show help                                          |
| `--reset`           | Clear license cache                                |
| `--verbose`         | Enable verbose output                              |

The `--domain` flag specifies the licensed domain. Each license is per-domain.

#### API Usage

```javascript
import { validateLicense, hasPaidFeatures } from "react-accessibility-tool";

// Validate license
const result = await validateLicense({
  licenseKey: process.env.ACCESS_LICENSE_KEY,
  domain: "example.edu",
});

if (hasPaidFeatures()) {
  // Unlock paid features
  console.log("Report export enabled");
} else {
  console.log("License required to export report");
}
```

### License Tiers

#### Free Mode

- No license key required
- All accessibility toolbar features
- Basic scanning with terminal output
- 11 automated WCAG checks
- Perfect for individual developers and small projects

#### Pro License

- Requires license key (contact us for licensing)
- All Free features plus:
  - Export reports in HTML, JSON, and PDF formats
  - Reports saved locally to your project directory
  - Detailed compliance analysis
  - WCAG 2.1 AA coverage summary
  - Issues grouped by WCAG principle
  - License metadata included in reports

**How Pro Reports Work:**

1. Contact us via email to purchase and receive a license key
2. Set `ACCESS_LICENSE_KEY` environment variable with your license key
3. Run CLI scan with `--export` option
4. Reports are generated and saved locally as files

**Example Pro Workflow:**

```bash
# Contact us at support@example.com to get your license key
export ACCESS_LICENSE_KEY=pk_live_xxx

# Run scan and export HTML report
a11y-scan --url=https://example.edu --domain=example.edu --export=html

# Generate PDF audit report
a11y-scan --url=https://example.edu --domain=example.edu --export=pdf

# Export JSON for CI/CD integration
a11y-scan --url=https://example.edu --domain=example.edu --export=json
```

Reports are saved to your current directory with filenames like:

- `a11y-report-example-edu-2024-01-15.html`
- `a11y-report-example-edu-2024-01-15.pdf`
- `a11y-report-example-edu-2024-01-15.json`

#### Enterprise License

- All Pro features plus:
  - Full compliance status (PASS/FAIL rating)
  - WCAG 2.1 Level AAA coverage
  - Priority support channel
  - Custom integration assistance
  - Extended license terms

**Enterprise Features:**

- Compliance PASS/FAIL status with detailed breakdown
- Executive summary reports for stakeholders
- Integration support for complex environments
- Dedicated support team for troubleshooting

### Report Delivery

Reports are **generated locally** and saved to your project directory. There is no email delivery - reports are files you own and control.

| Format   | Use Case                                                         |
| -------- | ---------------------------------------------------------------- |
| **PDF**  | Executive reports, compliance documentation, client deliverables |
| **HTML** | Interactive reports, team reviews, web-based sharing             |
| **JSON** | CI/CD pipelines, automated workflows, data analysis              |

### Obtaining a License

Contact us directly to purchase Pro or Enterprise licenses for your domain:

- Email: [support@example.com](mailto:support@example.com)
- Each license is tied to a specific domain
- Instant license key delivery after purchase
- 24-hour cache for performance
- Fail-open behavior (free mode if issues)
- Easy renewal process

### Fail-Open Behavior

The license system uses fail-open behavior:

- If the license API is unreachable, free mode is enabled
- If the license is expired or invalid, free mode is enabled
- Scanning is NEVER blocked - the tool always works
- Only paid features are restricted when no valid license

### Caching

License validation results are cached locally (`.tool-license-cache.json`) for 24 hours to reduce API calls and improve performance.

---

## Universal/Browser Usage

The license validation module works in ANY project - React, Next.js, WordPress, PHP, static HTML, or CDN-based sites.

### CDN/Static HTML

```html
<!-- Include in your HTML -->
<script src="https://cdn.yoursite.com/license-browser.js"></script>

<script>
  async function init() {
    const result = await LicenseValidate.autoValidate({
      licenseKey: "pk_live_xxx", // Your license key
      domain: "example.com",
    });

    if (LicenseValidate.hasPaidFeatures()) {
      enableReportExport();
    }
  }
  init();
</script>
```

### WordPress

Add to your theme's `header.php`:

```php
<?php
$license_key = get_option('your_license_key') ?: null;
?>
<script src="https://cdn.yoursite.com/license-browser.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
  const result = await LicenseValidate.autoValidate({
    licenseKey: <?php echo json_encode($license_key); ?>,
    domain: window.location.hostname
  });

  if (LicenseValidate.hasPaidFeatures()) {
    // Enable premium features
  }
});
</script>
```

### PHP

```php
<?php
// In your template file
$license_key = $_ENV['ACCESS_LICENSE_KEY'] ?? null;
?>
<script src="https://cdn.yoursite.com/license-browser.js"></script>
<script>
const result = await LicenseValidate.autoValidate({
  licenseKey: <?= json_encode($license_key) ?>,
  domain: window.location.hostname
});

if (LicenseValidate.hasPaidFeatures()) {
  console.log('Paid features enabled!');
}
</script>
```

### Browser API

| Method                                           | Description                     |
| ------------------------------------------------ | ------------------------------- |
| `LicenseValidate.validate({licenseKey, domain})` | Validate a license              |
| `LicenseValidate.autoValidate({licenseKey})`     | Auto-detect domain and validate |
| `LicenseValidate.hasPaidFeatures()`              | Check if paid features enabled  |
| `LicenseValidate.isLicenseValid()`               | Quick valid check               |
| `LicenseValidate.getLicenseInfo()`               | Get full license details        |
| `LicenseValidate.clearLicenseCache()`            | Clear cached validation         |
| `LicenseValidate.getStatusMessage()`             | User-friendly status            |

---

## Contributing

Contributions are welcome.
Feel free to open issues or submit pull requests for improvements or bug fixes.

---
