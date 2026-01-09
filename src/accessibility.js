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
};

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
   TOOLBAR UI
========================================================= */

document.addEventListener("DOMContentLoaded", createAccessibilityToolbar);

function createAccessibilityToolbar() {
  const floatingBtn = document.createElement("button");
  floatingBtn.className = "a1s_float-button";
  floatingBtn.innerHTML = " &#x2699; <span>Accessibility Tools</span>";
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
        <button class="a1s_reset">↺ Reset All Settings</button>
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
    { text: "Zoom In", icon: "A+", action: zoomIn },
    { text: "Zoom Out", icon: "A-", action: zoomOut },
    { text: "High Contrast", icon: "🎨", action: toggleHighContrast },
    { text: "Invert Colors", icon: "🌗", action: toggleInvertColors },
    { text: "Pause Animations", icon: "⏸️", action: toggleAnimations },
    { text: "Line Height", icon: "↕️", action: adjustLineHeight, max: 4 },
    { text: "Text Spacing", icon: "↔️", action: adjustTextSpacing, max: 4 },
    { text: "Highlight Links", icon: "🔗", action: highlightLinks },
    { text: "Dyslexia Font", icon: "🔤", action: toggleDyslexiaFont },
    { text: "Hide Images", icon: "🖼️", action: toggleImages },
    { text: "Text Align", icon: "📐", action: toggleTextAlign, max: 2 },
    { text: "Saturation", icon: "🎨", action: toggleSaturation, max: 3 },
    { text: "Cursor Size", icon: "🖱️", action: toggleCursor, max: 2 },
  ];

  buttons.forEach((btn) => {
    const el = document.createElement("button");
    el.className = "a1s_button";
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

function zoomIn() {
  A1S_ROOT()
    .querySelectorAll(A1S_TEXT_SELECTORS)
    .forEach((el) => {
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = size * 1.1 + "px";
    });
}

function zoomOut() {
  A1S_ROOT()
    .querySelectorAll(A1S_TEXT_SELECTORS)
    .forEach((el) => {
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = size * 0.9 + "px";
    });
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
  const aligns = ["", "center", "right"];
  A1S_STATE.textAlign = (A1S_STATE.textAlign + 1) % 3;
  A1S_ROOT().style.textAlign = aligns[A1S_STATE.textAlign];
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
function highlightLinks(btn) {
  const root = A1S_ROOT();
  const links = root.querySelectorAll("a");
  const active = btn.classList.toggle("active");

  links.forEach((a) => {
    if (active) {
      a.style.background = "#444701";
      a.style.color = "yellow";
    } else {
      a.style.background = "";
      a.style.color = "";
    }
  });
}

/* =========================================================
   RESET
========================================================= */
function resetAll() {
  const root = A1S_ROOT();

  /* -------------------------------
     1. Remove only A1S classes
  -------------------------------- */
  const a1sClasses = [
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
  ];

  root.classList.remove(...a1sClasses);

  /* -------------------------------
     2. Reset inline styles safely
  -------------------------------- */
  root.style.lineHeight = "";
  root.style.textAlign = "";
  root.style.letterSpacing = "";
  root.style.wordSpacing = "";
  root.style.cursor = "";

  /* -------------------------------
     3. Reset buttons UI
  -------------------------------- */
  document.querySelectorAll(".a1s_button").forEach((btn) => {
    btn.classList.remove("active");
    const bullets = btn.querySelector(".a1s_bullets");
    if (bullets) bullets.innerHTML = "";
  });

  /* -------------------------------
     4. Reset STATE properly
  -------------------------------- */
  Object.keys(A1S_STATE).forEach((key) => {
    A1S_STATE[key] = 0;
  });
}
