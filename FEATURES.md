# Accessibility Tool - Features Guide

## Simple Overview

This tool helps make websites accessible to people with disabilities. It checks for accessibility issues AND helps users with disabilities browse the site.

---

## Part 1: SCANNER FEATURES (CLI)

Checks websites for accessibility problems automatically.

### Current Features (11 Checks)

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

- **Level A** - Must have (our tool checks these)
- **Level AA** - Should have (most government requirement)
- **Level AAA** - Nice to have

Most US government sites require **WCAG 2.1 Level AA**.

---

## Part 2: USER FEATURES (Toolbar)

The floating toolbar lets users customize how they view the website.

### Current Features (13 Tools)

| #   | Feature              | WCAG   | Benefit                               |
| --- | -------------------- | ------ | ------------------------------------- |
| 1   | **Zoom In/Out**      | 1.4.4  | Enlarge text up to 200%               |
| 2   | **High Contrast**    | 1.4.11 | Maximum contrast mode                 |
| 3   | **Invert Colors**    | -      | Night mode / light sensitivity        |
| 4   | **Pause Animations** | 2.2.2  | Stops auto-playing content            |
| 5   | **Line Height**      | 1.4.8  | Increase text spacing                 |
| 6   | **Text Spacing**     | 1.4.8  | Letter/word spacing adjustment        |
| 7   | **Highlight Links**  | -      | Makes links more visible              |
| 8   | **Dyslexia Font**    | 1.4.8  | Easier to read for dyslexia           |
| 9   | **Hide Images**      | -      | For screen reader users               |
| 10  | **Text Align**       | -      | Left/Center/Right/Justify             |
| 11  | **Saturation**       | -      | Color adjustment                      |
| 12  | **Cursor Size**      | 2.5.1  | Larger pointer for motor disabilities |
| 13  | **Reset All**        | -      | Quick reset to default                |

---

## Part 3: PROPOSED NEW FEATURES

### Feature: Text-to-Speech (Read Aloud)

**What it does:** Reads page content aloud for blind or low-vision users.

**WCAG Compliance:**

- WCAG 2.1 Level A: 1.2.1 (Audio-only and video-only)
- Level AA: Not specifically required but recommended

**Implementation Options:**

| Option                     | Pros                   | Cons                       |
| -------------------------- | ---------------------- | -------------------------- |
| **Browser Speech API**     | Free, works everywhere | Limited voice options      |
| **WebSpeech API**          | Native to browsers     | Chrome/Edge only           |
| **Cloud TTS (AWS/Google)** | Professional voices    | Costs money, needs API key |

**Recommendation:** Use Web Speech API first (free, built-in), fall back to cloud TTS for pro users.

**Pro Feature?** Yes - require license for TTS

---

### Feature: Screen Reader Simulator

**What it does:** Shows what a screen reader would announce.

**WCAG Compliance:** Educational tool, not a requirement.

**Pro Feature?** Could be free or pro

---

### Feature: Keyboard-Only Navigation Map

**What it does:** Visualizes all keyboard-accessible elements.

**WCAG Compliance:** Helps test 2.1.1 (Keyboard)

**Pro Feature?** Could be free

---

### Feature: Accessibility Statement Generator

**What it does:** Creates a ready-to-use accessibility statement.

**WCAG Compliance:** Required for Level AA compliance (3.1.1)

**Pro Feature?** Yes - require license

---

### Feature: Auto-Fix Suggestions

**What it does:** One-click fixes for common issues.

**WCAG Compliance:** Not applicable

**Pro Feature?** Yes

---

### Feature: PDF Accessibility Check

**What it does:** Checks PDF documents for accessibility.

**WCAG Compliance:** 1.1.1 (PDF must be accessible)

**Pro Feature?** Yes

---

## Universal Platform Compatibility

All features work on:

| Platform          | How It Works                  |
| ----------------- | ----------------------------- |
| **React/Next.js** | npm install, import component |
| **WordPress**     | CDN script, PHP integration   |
| **Plain HTML**    | CDN script include            |
| **PHP/Laravel**   | CDN script + PHP variables    |
| **Static Sites**  | CDN script                    |
| **CLI/Bash**      | Node.js script                |

---

## Government Compliance

### Required Standards

- **Section 508** (US) - Requires WCAG 2.0 Level AA
- **ADA** (US) - Courts increasingly require WCAG 2.x
- **EN 301 549** (EU) - European accessibility standard

### Our Tool Coverage

| Requirement                 | Covered?             |
| --------------------------- | -------------------- |
| Keyboard navigation         | ✅ Scanner checks    |
| Screen reader compatibility | ✅ Scanner checks    |
| Color contrast              | ✅ Scanner + Toolbar |
| Text resizing               | ✅ Toolbar           |
| Focus indicators            | ✅ Scanner checks    |
| Language specification      | ✅ Scanner checks    |
| Accessible PDFs             | ❌ (proposed)        |
| Accessibility statement     | ❌ (proposed)        |

---

## License Tiers

| Tier           | Price      | Features                                                  |
| -------------- | ---------- | --------------------------------------------------------- |
| **Free**       | $0         | Scanner, 13 toolbar tools                                 |
| **Pro**        | Contact us | + Report export (HTML/PDF/JSON), Compliance status        |
| **Enterprise** | Contact us | + All Pro + TTS + Auto-fix + PDF check + Priority support |

---

## Getting a License

Contact us directly to purchase Pro or Enterprise licenses:

- Email: [support@example.com](mailto:support@example.com)
- Each license is tied to a specific domain
- Instant license key delivery after purchase

---

## Quick Start

```bash
# Install globally
npm install -g react-accessibility-tool

# Run scan
a11y-scan --url=https://example.edu --domain=example.edu

# With license (paid features)
ACCESS_LICENSE_KEY=xxx a11y-scan \
  --url=https://example.edu \
  --domain=example.edu \
  --output=html
```

---

## Questions?

This tool is designed to help government websites meet accessibility requirements. All features are aligned with WCAG 2.1 guidelines.
