Sure 👍
Below is the **README.md content in plain text**.
You can copy-paste this directly into a `README.md` file.

---

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
npm install accessibility-tool
```

Using yarn:

```
yarn add accessibility-tool
```

---

## Usage

### 1. Import the component and CSS

```js
import AccessibilityTool from "accessibility-tool";
import "accessibility-tool/accessibility-tool.css";
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

MIT License
Free for personal and commercial use.

---

## Contributing

Contributions are welcome.
Feel free to open issues or submit pull requests for improvements or bug fixes.

---
