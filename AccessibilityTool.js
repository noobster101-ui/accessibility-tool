"use client";

import { useEffect } from "react";

export default function AccessibilityTool({ right, bottom, top, left, bgColor, textColor, pro = false }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Pro configuration - support both boolean and object
    const proConfig =
      typeof pro === "boolean"
        ? { enabled: pro, features: { tooltip: pro, darkMode: pro, textToSpeech: pro } }
        : {
            enabled: false,
            features: {
              tooltip: false,
              darkMode: false,
              textToSpeech: false,
              ...pro?.features,
            },
            ...pro,
          };

    // Inject Pro CSS via JavaScript
    function injectProStyles() {
      const styleId = "a1s-pro-styles";
      if (document.getElementById(styleId)) return;

      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        /* Dark Mode (Pro) */
        .a1s-dark-mode {
          filter: invert(1) hue-rotate(180deg) brightness(0.95) !important;
        }
        
        .a1s-dark-mode img, 
        .a1s-dark-mode video,
        .a1s-dark-mode iframe {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        
        .a1s-dark-mode .a1s_sidebar {
          background: #1a1a1a !important;
          color: #fff !important;
        }
        
        .a1s-dark-mode .a1s_float-button {
          background: #2d2d2d !important;
          color: #fff !important;
        }
        
        .a1s-dark-mode .a1s_button {
          background: #3d3d3d !important;
          color: #fff !important;
          border-color: #555 !important;
        }
        
        .a1s-dark-mode .a1s_header {
          background: #2d2d2d !important;
        }
        
        .a1s-dark-mode .a1s_close-button {
          color: #fff !important;
        }
        
        .a1s-dark-mode .a1s_reset {
          background: #4a4a4a !important;
          color: #fff !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Inject Pro styles if dark mode feature is enabled
    if (proConfig.enabled && proConfig.features.darkMode) {
      injectProStyles();
    }

    /* =========================================================
       ROOT + STATE
    ========================================================= */

    const A1S_ROOT = () => document.getElementById("a1s-root") || document.body;

    const A1S_STATE = {
      lineHeight: 0,
      textAlign: 0,
      saturation: 0,
      cursor: 0,
      textSpacing: 0,
      zoom: 0,
      darkMode: false,
      textToSpeech: false,
      tooltip: false,
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
    let speechSynthesis = null;
    let isSpeaking = false;
    let availableVoices = [];

    /* =========================================================
       TOOLBAR UI
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
            <button class="a1s_reset">🔄 Reset All Settings</button>
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
       BUTTON CREATION
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

      // Add Pro features if enabled
      if (proConfig.enabled) {
        if (proConfig.features.darkMode) {
          buttons.push({ text: "Dark Mode", icon: "🌙", action: toggleDarkMode, className: "dark-mode-btn", pro: true });
        }
        if (proConfig.features.textToSpeech) {
          buttons.push({ text: "Text-to-Speech", icon: "🔊", action: toggleTextToSpeech, className: "tts-btn", pro: true });
        }
      }

      buttons.forEach((btn) => {
        const el = document.createElement("button");
        let className = "a1s_button";
        if (btn.className) className += " " + btn.className;
        if (btn.pro) className += " a1s_pro-button";
        el.className = className;
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
       FREE FEATURES
    ========================================================= */

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

      const zoomInBtn = Array.from(document.querySelectorAll(".a1s_button")).find(
        (b) => b.querySelector(".a1s_label")?.textContent === "Zoom In"
      );
      if (zoomInBtn) renderBullets(zoomInBtn, A1S_STATE.zoom);

      const zoomOutBtn = document.querySelector(".a1s_button.zoom-out");
      if (zoomOutBtn && A1S_STATE.zoom <= 0) zoomOutBtn.classList.add("disabled");
      else if (zoomOutBtn) zoomOutBtn.classList.remove("disabled");

      if (btn) renderBullets(btn, A1S_STATE.zoom);
    }

    function toggleHighContrast(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_high-contrast");
      btn.classList.toggle("active");
    }

    function toggleInvertColors(btn) {
      const root = A1S_ROOT();
      root.classList.toggle("a1s_invert-colors");
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

    function adjustLineHeight(btn) {
      A1S_STATE.lineHeight = (A1S_STATE.lineHeight + 1) % 5;
      A1S_ROOT().style.lineHeight = A1S_STATE.lineHeight === 0 ? "" : 1.6 + A1S_STATE.lineHeight * 0.2;
      renderBullets(btn, A1S_STATE.lineHeight);
    }

    function toggleTextAlign(btn) {
      const root = A1S_ROOT();
      const classes = ["a1s_align-left", "a1s_align-center", "a1s_align-right", "a1s_align-justify"];

      root.classList.remove(...classes);

      A1S_STATE.textAlign = (A1S_STATE.textAlign + 1) % 5;

      if (A1S_STATE.textAlign > 0) {
        root.classList.add(classes[A1S_STATE.textAlign - 1]);
      }

      renderBullets(btn, A1S_STATE.textAlign);
    }

    function toggleSaturation(btn) {
      const root = A1S_ROOT();
      const classes = ["a1s_saturation-low", "a1s_saturation-high", "a1s_saturation-desaturate"];

      root.classList.remove(...classes);

      A1S_STATE.saturation = (A1S_STATE.saturation + 1) % 4;

      if (A1S_STATE.saturation > 0) {
        root.classList.add(classes[A1S_STATE.saturation - 1]);
      }

      renderBullets(btn, A1S_STATE.saturation);
    }

    function toggleCursor(btn) {
      const root = A1S_ROOT();
      root.classList.remove("a1s_cursor-medium", "a1s_cursor-large");

      A1S_STATE.cursor = (A1S_STATE.cursor + 1) % 3;

      if (A1S_STATE.cursor === 1) {
        root.classList.add("a1s_cursor-medium");
      }
      if (A1S_STATE.cursor === 2) {
        root.classList.add("a1s_cursor-large");
      }
      if (A1S_STATE.cursor === 0) {
        root.style.cursor = "";
      }

      renderBullets(btn, A1S_STATE.cursor);
    }

    function adjustTextSpacing(btn) {
      A1S_STATE.textSpacing = (A1S_STATE.textSpacing || 0) + 1;
      if (A1S_STATE.textSpacing > 4) A1S_STATE.textSpacing = 0;

      const root = A1S_ROOT();
      const spacing = ["", "0.05em", "0.1em", "0.2em", "0.3em"];
      root.style.letterSpacing = spacing[A1S_STATE.textSpacing];
      root.style.wordSpacing = spacing[A1S_STATE.textSpacing];

      renderBullets(btn, A1S_STATE.textSpacing);
    }

    function highlightLinks(btn, forceReset = false) {
      const root = A1S_ROOT();
      const links = root.querySelectorAll("a");

      const active = forceReset ? false : btn.classList.toggle("active");

      links.forEach((a) => {
        a.style.background = active ? "#444701" : "";
        a.style.color = active ? "yellow" : "";
      });

      if (forceReset && btn) {
        btn.classList.remove("active");
      }
    }

    /* =========================================================
       PRO FEATURES
    ========================================================= */

    // Dark Mode (Pro)
    function toggleDarkMode(btn) {
      if (!proConfig.features.darkMode) return;

      A1S_STATE.darkMode = !A1S_STATE.darkMode;
      const root = A1S_ROOT();

      if (A1S_STATE.darkMode) {
        root.classList.add("a1s-dark-mode");
        btn.classList.add("active");
      } else {
        root.classList.remove("a1s-dark-mode");
        btn.classList.remove("active");
      }
    }

    /* =========================================================
       TEXT-TO-SPEECH (Hardcoded Indian Voice)
    ========================================================= */

    // Hardcoded TTS settings for Indian accent
    const TTS_CONFIG = {
      pitch: 1.0,
      rate: 0.88,
      volume: 1.0,
    };

    // Initialize voices
    function initializeVoices() {
      if (!speechSynthesis) {
        speechSynthesis = window.speechSynthesis;
      }

      if (speechSynthesis) {
        availableVoices = speechSynthesis.getVoices() || [];

        if (availableVoices.length === 0) {
          speechSynthesis.onvoiceschanged = () => {
            availableVoices = speechSynthesis.getVoices() || [];
          };
        }
      }
    }

    // Find best Indian voice (automatic, no user selection)
    function findBestIndianVoice() {
      // Ensure we have voices loaded
      if (!availableVoices || availableVoices.length === 0) {
        if (speechSynthesis) {
          availableVoices = speechSynthesis.getVoices() || [];
        }
      }

      if (availableVoices.length === 0) {
        return null;
      }

      // Priority order for Indian accent voices
      const priorityPatterns = [
        { lang: "en-IN", keywords: ["google", "english", "india"] },
        { lang: "hi-IN", keywords: ["google", "hindi"] },
        { lang: "mr-IN", keywords: ["google", "marathi"] },
        { lang: "en-IN", keywords: [] },
        { lang: "hi", keywords: ["google", "hindi"] },
        { lang: "mr", keywords: ["google", "marathi"] },
        { lang: "en-US", keywords: ["google"] },
        { lang: "en-GB", keywords: ["google"] },
      ];

      // Look for Indian voices
      for (const pattern of priorityPatterns) {
        const found = availableVoices.find((v) => {
          const vLang = v.lang || "";
          const vName = v.name.toLowerCase();

          let langMatch = false;
          if (pattern.lang === "en-IN") {
            langMatch = vLang === "en-IN" || vLang.startsWith("en-");
          } else if (pattern.lang === "hi-IN") {
            langMatch = vLang === "hi-IN" || vLang === "hi";
          } else if (pattern.lang === "mr-IN") {
            langMatch = vLang === "mr-IN" || vLang === "mr";
          } else {
            langMatch = vLang === pattern.lang || vLang.startsWith(pattern.lang + "-");
          }

          const keywordMatch = pattern.keywords.length === 0 || pattern.keywords.some((kw) => vName.includes(kw));

          return langMatch && keywordMatch;
        });

        if (found) return found;
      }

      // Any Indian language voice
      const indianVoice = availableVoices.find((v) => {
        const lang = v.lang || "";
        return (
          lang === "en-IN" ||
          lang === "hi-IN" ||
          lang === "mr-IN" ||
          lang.startsWith("en-") ||
          lang.startsWith("hi-") ||
          lang.startsWith("mr-")
        );
      });

      if (indianVoice) return indianVoice;

      // Prefer Google voices
      const googleVoice = availableVoices.find((v) => v.name.toLowerCase().includes("google"));
      if (googleVoice) return googleVoice;

      // Final fallback
      return availableVoices[0];
    }

    // Text-to-Speech (Pro) - Hardcoded Indian voice, no controls
    function toggleTextToSpeech(btn) {
      if (!proConfig.features.textToSpeech) return;

      if (!("speechSynthesis" in window)) {
        alert("Text-to-Speech is not supported in this browser");
        return;
      }

      A1S_STATE.textToSpeech = !A1S_STATE.textToSpeech;

      if (A1S_STATE.textToSpeech) {
        btn.classList.add("active");
        enableTextToSpeechHover();
      } else {
        btn.classList.remove("active");
        disableTextToSpeechHover();
      }
    }

    let ttsHoverElements = [];

    function enableTextToSpeechHover() {
      if (!speechSynthesis) {
        speechSynthesis = window.speechSynthesis;
        initializeVoices();
      }

      const root = A1S_ROOT();

      // Add hover event listeners to text elements
      const textElements = root.querySelectorAll(
        "p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, article, section, main, div, span, a, label"
      );

      textElements.forEach((el) => {
        if (el.hasAttribute("data-tts-listener")) return;

        el.setAttribute("data-tts-listener", "true");

        const mouseenterHandler = (e) => {
          if (speechSynthesis) {
            speechSynthesis.cancel();
          }

          const textContent = getElementTextContent(e.target);

          if (textContent.trim()) {
            speakText(textContent);
          }
        };

        el.addEventListener("mouseenter", mouseenterHandler);
        ttsHoverElements.push({ element: el, handler: mouseenterHandler });
      });
    }

    function disableTextToSpeechHover() {
      ttsHoverElements.forEach(({ element, handler }) => {
        element.removeEventListener("mouseenter", handler);
        element.removeAttribute("data-tts-listener");
      });

      ttsHoverElements = [];
      stopTextToSpeech();
    }

    function speakText(text) {
      if (!speechSynthesis) {
        speechSynthesis = window.speechSynthesis;
        initializeVoices();
      }

      if (!speechSynthesis) return;

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Use hardcoded Indian voice
      const selectedVoice = findBestIndianVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Apply hardcoded settings
      utterance.pitch = TTS_CONFIG.pitch;
      utterance.rate = TTS_CONFIG.rate;
      utterance.volume = TTS_CONFIG.volume;

      utterance.onstart = () => {
        isSpeaking = true;
      };

      utterance.onend = () => {
        isSpeaking = false;
      };

      utterance.onerror = () => {
        isSpeaking = false;
      };

      speechSynthesis.speak(utterance);
    }

    function getElementTextContent(element) {
      // Skip hidden elements
      if (element.offsetParent === null) return "";

      // Skip script and style tags
      if (element.tagName === "SCRIPT" || element.tagName === "STYLE") return "";

      // Get text content, but limit length
      const text = element.textContent ? element.textContent.trim() : "";

      if (text) {
        // Return limited text
        return text.substring(0, 500);
      }

      return "";
    }

    function stopTextToSpeech() {
      if (speechSynthesis) {
        speechSynthesis.cancel();
        isSpeaking = false;
      }
    }

    function getPageTextContent(element) {
      const textSelectors = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "blockquote", "article", "section", "main", "div"];

      let text = "";

      element.querySelectorAll(textSelectors.join(",")).forEach((el) => {
        // Skip hidden elements
        if (el.offsetParent === null) return;
        // Skip script and style tags
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;

        const textContent = el.textContent.trim();
        if (textContent) {
          text += textContent + " ";
        }
      });

      return text.substring(0, 5000); // Limit to 5000 characters
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
        "a1s_align-justify",
        "a1s-dark-mode"
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
      A1S_STATE.darkMode = false;

      // Disable text-to-speech hover and clean up listeners
      if (A1S_STATE.textToSpeech) {
        disableTextToSpeechHover();
        A1S_STATE.textToSpeech = false;
      }

      // reset buttons UI
      document.querySelectorAll(".a1s_button").forEach((btn) => {
        btn.classList.remove("active");
        const bullets = btn.querySelector(".a1s_bullets");
        if (bullets) bullets.innerHTML = "";
      });

      // Safe Zoom Out button handling
      const zoomOutBtn = document.querySelector(".a1s_button.zoom-out");
      if (zoomOutBtn) {
        zoomOutBtn.classList.add("disabled");
      }
    }

    createAccessibilityToolbar();

    // Cleanup function to remove toolbar on unmount
    return () => {
      const floatBtn = document.querySelector(".a1s_float-button");
      const sidebar = document.querySelector(".a1s_sidebar");
      const proStyles = document.getElementById("a1s-pro-styles");

      if (floatBtn) floatBtn.remove();
      if (sidebar) sidebar.remove();
      if (proStyles) proStyles.remove();

      window.__A1S_INIT__ = false;
    };
  }, [right, bottom, top, left, bgColor, textColor, pro]);

  return null;
}
