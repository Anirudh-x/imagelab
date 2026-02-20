/**
 * resizable.js
 * Implements drag-to-resize splitters for all panes in ImageLab.
 *
 * Splitters:
 *  - #v-splitter       : vertical, resizes #left-panel vs #right-panel
 *  - #h-splitter-info  : horizontal, resizes #blocklyDiv vs #information-pane
 *  - #h-splitter-preview: horizontal, resizes #preview-pane-div vs #properties-pane-div
 */

(function () {
  // Tracks which splitter is currently being dragged
  let activeSplitter = null;
  let startPos = 0;
  let startSizeA = 0;
  let startSizeB = 0;

  /**
   * Initialises a vertical (left/right) splitter.
   * @param {string} splitterId - ID of the splitter div
   * @param {string} panelAId   - ID of the left panel
   * @param {string} panelBId   - ID of the right panel
   * @param {number} minA       - minimum width in px for panel A
   * @param {number} minB       - minimum width in px for panel B
   */
  function initVerticalSplitter(splitterId, panelAId, panelBId, minA, minB) {
    const splitter = document.getElementById(splitterId);
    const panelA = document.getElementById(panelAId);
    const panelB = document.getElementById(panelBId);
    if (!splitter || !panelA || !panelB) return;

    splitter.addEventListener("mousedown", function (e) {
      activeSplitter = {
        type: "v",
        splitter,
        panelA,
        panelB,
        minA: minA || 400,
        minB: minB || 250,
      };
      startPos = e.clientX;
      startSizeA = panelA.getBoundingClientRect().width;
      startSizeB = panelB.getBoundingClientRect().width;
      splitter.classList.add("dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    });
  }

  /**
   * Initialises a horizontal (top/bottom) splitter.
   * @param {string} splitterId - ID of the splitter div
   * @param {string} panelAId   - ID of the top panel
   * @param {string} panelBId   - ID of the bottom panel
   * @param {number} minA       - minimum height in px for panel A
   * @param {number} minB       - minimum height in px for panel B
   */
  function initHorizontalSplitter(splitterId, panelAId, panelBId, minA, minB) {
    const splitter = document.getElementById(splitterId);
    const panelA = document.getElementById(panelAId);
    const panelB = document.getElementById(panelBId);
    if (!splitter || !panelA || !panelB) return;

    splitter.addEventListener("mousedown", function (e) {
      activeSplitter = {
        type: "h",
        splitter,
        panelA,
        panelB,
        minA: minA || 150,
        minB: minB || 80,
      };
      startPos = e.clientY;
      startSizeA = panelA.getBoundingClientRect().height;
      startSizeB = panelB.getBoundingClientRect().height;
      splitter.classList.add("dragging");
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    });
  }

  // Global mousemove handles whichever splitter is active
  document.addEventListener("mousemove", function (e) {
    if (!activeSplitter) return;

    if (activeSplitter.type === "v") {
      const dx = e.clientX - startPos;
      const newA = startSizeA + dx;
      const newB = startSizeB - dx;
      if (newA >= activeSplitter.minA && newB >= activeSplitter.minB) {
        activeSplitter.panelA.style.flex = "none";
        activeSplitter.panelA.style.width = newA + "px";
        activeSplitter.panelB.style.width = newB + "px";
        // Notify Blockly that its container size changed
        if (typeof workspace !== "undefined") {
          Blockly.svgResize(workspace);
        }
      }
    } else if (activeSplitter.type === "h") {
      const dy = e.clientY - startPos;
      const newA = startSizeA + dy;
      const newB = startSizeB - dy;
      if (newA >= activeSplitter.minA && newB >= activeSplitter.minB) {
        activeSplitter.panelA.style.flex = "none";
        activeSplitter.panelA.style.height = newA + "px";
        activeSplitter.panelB.style.height = newB + "px";
        // Notify Blockly when the workspace pane is resized
        if (
          activeSplitter.panelA.id === "blocklyDiv" &&
          typeof workspace !== "undefined"
        ) {
          Blockly.svgResize(workspace);
        }
      }
    }
  });

  // Global mouseup cleans up after any drag
  document.addEventListener("mouseup", function () {
    if (!activeSplitter) return;
    activeSplitter.splitter.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    activeSplitter = null;
  });

  // Initialise all splitters once the DOM is ready
  window.addEventListener("load", function () {
    // Vertical splitter between workspace column and preview column
    initVerticalSplitter("v-splitter", "left-panel", "right-panel", 400, 250);

    // Horizontal splitter between Blockly workspace and information pane
    initHorizontalSplitter(
      "h-splitter-info",
      "blocklyDiv",
      "information-pane",
      200,
      60
    );

    // Horizontal splitter between preview pane and properties pane
    initHorizontalSplitter(
      "h-splitter-preview",
      "preview-pane-div",
      "properties-pane-div",
      200,
      100
    );
  });
})();
