"use client";

import { useEffect } from "react";

export default function AccessibilityTool({ right, bottom, top, left, bgColor, textColor }) {
  // Only run on client side to avoid SSR issues
  if (typeof window === "undefined") {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__A1S_INIT__) return;
    window.__A1S_INIT__ = true;

    /* =========================================================
       ROOT + STATE (UNCHANGED)
    ========================================================= */

    const A1S_ROOT = () => document.getElementById("a1s-root") || document.body;

    const A1S_STATE = {
      lineHeight: 0,
      textAlign: 0,
      saturation: 0,
      cursor: 0,
      textSpacing: 0,
      zoom: 0,
    };

    const A1S_ORIGINAL_FONT_SIZES = new WeakMap();

    const A1S_TEXT_SELECTORS = [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "label",
      "span",
      "a",
      "li",
      "blockquote",
      "td",
      "th",
      "button",
      "input",
      "textarea",
      "small",
      "em",
      "strong",
      "q",
      ".typography",
    ].join(",");

    let a1sSidebar = null;

    /* =========================================================
       TOOLBAR UI (UNCHANGED STRUCTURE)
    ========================================================= */

    function createAccessibilityToolbar() {
      const floatingBtn = document.createElement("button");
      floatingBtn.className = "a1s_float-button";
      floatingBtn.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="30px" height="30px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM9.25 3.75C9.25 4.44036 8.69036 5 8 5C7.30964 5 6.75 4.44036 6.75 3.75C6.75 3.05964 7.30964 2.5 8 2.5C8.69036 2.5 9.25 3.05964 9.25 3.75ZM12 8H9.41901L11.2047 13H9.081L8 9.97321L6.91901 13H4.79528L6.581 8H4V6H12V8Z" fill="#000000"/>
</svg>  <span>Accessibility Tools</span>`;
      floatingBtn.style.right = right;
      floatingBtn.style.left = left;
      floatingBtn.style.top = top;
      floatingBtn.style.bottom = bottom;
      floatingBtn.style.background = bgColor;
      floatingBtn.style.color = textColor;

      document.body.appendChild(floatingBtn);

      if (!a1sSidebar) {
        a1sSidebar = document.createElement("div");
        a1sSidebar.className = "a1s_sidebar";

        a1sSidebar.innerHTML = `
          <div class="a1s_header">
            <h3>Accessibility Tools</h3>
            <button class="a1s_close-button">×</button>
          </div>
          <div class="a1s_content">
            <div class="a1s_buttons-grid"></div>
          </div>
          <div class="a1s_footer">
            <button class="a1s_reset">&#x27F3; Reset All Settings</button>
          </div>
        `;

        document.body.appendChild(a1sSidebar);

        a1sSidebar.querySelector(".a1s_close-button").onclick = () => a1sSidebar.classList.remove("open");

        a1sSidebar.querySelector(".a1s_reset").onclick = resetAll;

        createButtons(a1sSidebar.querySelector(".a1s_buttons-grid"));
      }

      floatingBtn.onclick = () => a1sSidebar.classList.toggle("open");
    }

    /* =========================================================
       BUTTON CREATION (ICONS PRESERVED)
    ========================================================= */

    function createButtons(grid) {
      const buttons = [
        { text: "Zoom In", icon: "A+", action: zoomIn, max: 5 },
        { text: "Zoom Out", icon: "A-", action: zoomOut, max: 5, className: "zoom-out" },
        { text: "High Contrast", icon: "🎨", action: toggleHighContrast },
        { text: "Invert Colors", icon: "🌗", action: toggleInvertColors },
        { text: "Pause Animations", icon: "⏸️", action: toggleAnimations },
        { text: "Line Height", icon: "↕️", action: adjustLineHeight, max: 4 },
        { text: "Text Spacing", icon: "↔️", action: adjustTextSpacing, max: 4 },
        { text: "Highlight Links", icon: "🔗", action: highlightLinks },
        { text: "Dyslexia Font", icon: "🔤", action: toggleDyslexiaFont },
        { text: "Hide Images", icon: "🖼️", action: toggleImages },
        { text: "Text Align", icon: "📐", action: toggleTextAlign, max: 4 },
        { text: "Saturation", icon: "🎨", action: toggleSaturation, max: 3 },
        { text: "Cursor Size", icon: "🖱️", action: toggleCursor, max: 2 },
      ];

      buttons.forEach((btn) => {
        const el = document.createElement("button");
        el.className = "a1s_button" + (btn.className ? " " + btn.className : "");
        el.innerHTML = `
          <span class="a1s_icon">${btn.icon}</span>
          <span class="a1s_label">${btn.text}</span>
          <span class="a1s_bullets"></span>
        `;
        el.onclick = () => btn.action(el);
        if (btn.max) el.dataset.max = btn.max;
        grid.appendChild(el);
      });
    }

    /* =========================================================
   BULLET RENDERING
========================================================= */

    function renderBullets(btn, level) {
      const max = Number(btn.dataset.max || 0);
      const wrap = btn.querySelector(".a1s_bullets");
      wrap.innerHTML = "";

      if (!max || level === 0) {
        btn.classList.remove("active");
        return;
      }

      for (let i = 1; i <= max; i++) {
        const dot = document.createElement("span");
        if (i <= level) dot.classList.add("active");
        wrap.appendChild(dot);
      }

      btn.classList.add("active");
    }

    /* =========================================================
   MOMENTARY ACTIONS
========================================================= */
    // function applyFontZoom() {
    //   const factor = 1 + A1S_STATE.fontZoom * 0.1;

    //   A1S_ROOT()
    //     .querySelectorAll(A1S_TEXT_SELECTORS)
    //     .forEach((el) => {
    //       // store original size once
    //       if (!A1S_ORIGINAL_FONT_SIZES.has(el)) {
    //         const originalSize = parseFloat(getComputedStyle(el).fontSize);
    //         A1S_ORIGINAL_FONT_SIZES.set(el, originalSize);
    //       }

    //       const baseSize = A1S_ORIGINAL_FONT_SIZES.get(el);
    //       el.style.fontSize = baseSize * factor + "px";
    //     });
    // }

    function zoomIn(btn) {
      if (A1S_STATE.zoom >= 5) return;

      A1S_STATE.zoom++;

      A1S_ROOT()
        .querySelectorAll(A1S_TEXT_SELECTORS)
        .forEach((el) => {
          if (!A1S_ORIGINAL_FONT_SIZES.has(el)) {
            A1S_ORIGINAL_FONT_SIZES.set(el, parseFloat(getComputedStyle(el).fontSize));
          }

          const base = A1S_ORIGINAL_FONT_SIZES.get(el);
          el.style.fontSize = base * (1 + A1S_STATE.zoom * 0.1) + "px";
        });

      renderBullets(btn, A1S_STATE.zoom);
    }

    /* =========================================================
   TOGGLES (ON / OFF)
========================================================= */

    function toggleHighContrast(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_high-contrast");
      btn.classList.toggle("active");
    }

    function toggleAnimations(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_pause-animations");
      btn.classList.toggle("active");
    }

    function toggleDyslexiaFont(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_dyslexia-fonts");
      btn.classList.toggle("active");
    }

    function toggleImages(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_hide-images");
      btn.classList.toggle("active");
    }

    /* =========================================================
   MULTI-LEVEL FEATURES
========================================================= */

    function adjustLineHeight(btn) {
      A1S_STATE.lineHeight = (A1S_STATE.lineHeight + 1) % 5;
      A1S_ROOT().style.lineHeight = A1S_STATE.lineHeight === 0 ? "" : 1.6 + A1S_STATE.lineHeight * 0.2;
      renderBullets(btn, A1S_STATE.lineHeight);
    }
    function toggleTextAlign(btn) {
      const root = A1S_ROOT();
      const classes = ["a1s_align-left", "a1s_align-center", "a1s_align-right", "a1s_align-justify"];

      // initialize state
      if (typeof A1S_STATE.textAlign !== "number") {
        A1S_STATE.textAlign = 0;
      }

      // increment state (0 → 1 → 2 → 3 → 0)
      A1S_STATE.textAlign = (A1S_STATE.textAlign + 1) % classes.length;

      // remove all alignment classes
      root.classList.remove(...classes);

      // apply the correct class
      root.classList.add(classes[A1S_STATE.textAlign]);

      renderBullets(btn, A1S_STATE.textAlign);
    }

    // Toggle Saturations
    function toggleSaturation(btn) {
      const root = A1S_ROOT();
      const classes = ["a1s_saturation-low", "a1s_saturation-high", "a1s_saturation-desaturate"];

      // remove all saturation classes
      root.classList.remove(...classes);

      // increment state
      A1S_STATE.saturation = (A1S_STATE.saturation + 1) % 4;

      // apply class if not default (0)
      if (A1S_STATE.saturation > 0) {
        root.classList.add(classes[A1S_STATE.saturation - 1]);
      }

      // update bullets
      renderBullets(btn, A1S_STATE.saturation);
    }

    // Toggle Cursor

    function toggleCursor(btn) {
      const root = A1S_ROOT();
      root.classList.remove("a1s_cursor-medium", "a1s_cursor-large");

      A1S_STATE.cursor = (A1S_STATE.cursor + 1) % 3;

      if (A1S_STATE.cursor === 1) {
        root.classList.add("a1s_cursor-medium");
        root.style.cursor = "url(data:image/svg+xml,<svg ...></svg>) 10 10, auto";
      }
      if (A1S_STATE.cursor === 2) {
        root.classList.add("a1s_cursor-large");
        root.style.cursor = "url(data:image/svg+xml,<svg ...></svg>) 16 16, auto";
      }
      if (A1S_STATE.cursor === 0) {
        root.style.cursor = "";
      }

      renderBullets(btn, A1S_STATE.cursor);
    }

    // Invert Colors
    function toggleInvertColors(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_invert-colors");
      btn.classList.toggle("active");
    }

    // Text Spacing
    function adjustTextSpacing(btn) {
      A1S_STATE.textSpacing = (A1S_STATE.textSpacing || 0) + 1;
      if (A1S_STATE.textSpacing > 4) A1S_STATE.textSpacing = 0;

      const root = A1S_ROOT();
      const spacing = ["", "0.05em", "0.1em", "0.2em", "0.3em"];
      root.style.letterSpacing = spacing[A1S_STATE.textSpacing];
      root.style.wordSpacing = spacing[A1S_STATE.textSpacing];

      renderBullets(btn, A1S_STATE.textSpacing);
    }

    // Highlight Links
    function highlightLinks(btn, forceReset = false) {
      const root = A1S_ROOT();
      const links = root.querySelectorAll("a");

      // determine active state
      const active = forceReset ? false : btn.classList.toggle("active");

      links.forEach((a) => {
        a.style.background = active ? "#444701" : "";
        a.style.color = active ? "yellow" : "";
      });

      // ensure button state is correct on reset
      if (forceReset && btn) {
        btn.classList.remove("active");
      }
    }

    function zoomOut(btn) {
      if (A1S_STATE.zoom <= 0) return;

      A1S_STATE.zoom--;

      A1S_ROOT()
        .querySelectorAll(A1S_TEXT_SELECTORS)
        .forEach((el) => {
          const base = A1S_ORIGINAL_FONT_SIZES.get(el);
          if (!base) return;

          if (A1S_STATE.zoom === 0) {
            el.style.fontSize = "";
            A1S_ORIGINAL_FONT_SIZES.delete(el);
          } else {
            el.style.fontSize = base * (1 + A1S_STATE.zoom * 0.1) + "px";
          }
        });

      // update Zoom In bullets safely
      const zoomInBtn = Array.from(document.querySelectorAll(".a1s_button")).find(
        (b) => b.querySelector(".a1s_label")?.textContent === "Zoom In"
      );
      if (zoomInBtn) renderBullets(zoomInBtn, A1S_STATE.zoom);

      // safe Zoom Out button
      const zoomOutBtn = document.querySelector(".a1s_button.zoom-out");
      if (zoomOutBtn && A1S_STATE.zoom <= 0) zoomOutBtn.classList.add("disabled");
      else if (zoomOutBtn) zoomOutBtn.classList.remove("disabled");

      // update clicked button bullets
      if (btn) renderBullets(btn, A1S_STATE.zoom);
    }

    /* =========================================================
   RESET
========================================================= */
    function resetAll() {
      const root = A1S_ROOT();

      // remove all classes
      root.classList.remove(
        "a1s_high-contrast",
        "a1s_pause-animations",
        "a1s_dyslexia-fonts",
        "a1s_hide-images",
        "a1s_invert-colors",
        "a1s_saturation-low",
        "a1s_saturation-high",
        "a1s_saturation-desaturate",
        "a1s_cursor-medium",
        "a1s_cursor-large",
        "a1s_align-left",
        "a1s_align-center",
        "a1s_align-right",
        "a1s_align-justify"
      );

      // reset inline styles
      root.style.lineHeight = "";
      root.style.textAlign = "";
      root.style.letterSpacing = "";
      root.style.wordSpacing = "";
      root.style.cursor = "";

      // reset anchor
      root.querySelectorAll("a").forEach((a) => {
        a.style.background = "";
        a.style.color = "";
      });

      // reset font sizes
      root.querySelectorAll(A1S_TEXT_SELECTORS).forEach((el) => {
        el.style.fontSize = "";
        A1S_ORIGINAL_FONT_SIZES.delete(el);
      });

      // reset state
      Object.keys(A1S_STATE).forEach((k) => {
        A1S_STATE[k] = 0;
      });

      // reset buttons UI
      document.querySelectorAll(".a1s_button").forEach((btn) => {
        btn.classList.remove("active");
        const bullets = btn.querySelector(".a1s_bullets");
        if (bullets) bullets.innerHTML = "";
      });

      // ✅ Safe Zoom Out button handling
      const zoomOutBtn = document.querySelector(".a1s_button.zoom-out");
      if (zoomOutBtn) {
        zoomOutBtn.classList.add("disabled");
      }
    }

    createAccessibilityToolbar();
  }, [right, bottom, top, left, bgColor, textColor]);

  return null;
}
