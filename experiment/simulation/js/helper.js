/**
 * File containing helper functions for DTM simulation
 */

/**
 * Creates a new SVG element
 * @param {string} tag - The SVG tag to create
 * @param {Array} attr - Array of attribute name-value pairs
 * @returns {Element} The created SVG element
 */
function newElementNS(tag, attr) {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  attr.forEach(function(item) {
    elem.setAttribute(item[0], item[1]);
  });
  return elem;
}

/**
 * Creates a new HTML element
 * @param {string} tag - The HTML tag to create
 * @param {Array} attr - Array of attribute name-value pairs
 * @returns {Element} The created HTML element
 */
function newElement(tag, attr) {
  const elem = document.createElement(tag);
  attr.forEach(function(item) {
    elem.setAttribute(item[0], item[1]);
  });
  return elem;
}

/**
 * Clears all children from an element
 * @param {Element} elem - The element to clear
 */
function clearElem(elem) {
  while(elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

/**
 * Displays the DTM visualization on the canvas
 * @param {Element} canvas - The main canvas for tape cells
 * @param {Element} canvas2 - The canvas for state display
 * @param {Object} dtm - The DTM configuration object
 * @param {number} inputIndex - Current input index
 * @param {number} stateIndex - Current state index
 * @param {string} path - Path type (optional)
 */
function displayCanvas(canvas, canvas2, dtm, inputIndex, stateIndex, path) {
  // Color constants - hardcoded as requested
  const fillDefault = "rgba(140, 90, 255, 0.1)"; // Light purple for regular cells
  const fillActive = "#4ADE80";  // Green for active cell
  const fillInactive = "rgba(167, 139, 250, 0.3)"; // Purple for other cells
  const color = "#7c3aed";       // Purple for borders
  const strokeWidth = "2px";

  const pathSetting = path === "rej" ? "reject_path" : "states";
  const str = dtm["input"][inputIndex][pathSetting][stateIndex][0];
  const activeCellIndex = dtm["input"][inputIndex][pathSetting][stateIndex][1];
  const currentState = dtm["input"][inputIndex][pathSetting][stateIndex][2];

  // Layout configuration
  const startX = 10;
  const startY = 10;
  const cellWidth = 60;
  const cellHeight = 60;
  const textOffsetY = cellHeight / 2 + 5;
  const fontSize = "20px";

  // Clear existing elements
  clearElem(canvas);
  clearElem(canvas2);

  // Draw tape cells
  for (let cellIndex = 0; cellIndex < str.length; ++cellIndex) {
    const isActive = cellIndex === activeCellIndex;

    // Create rectangle for each cell
    const cell = newElementNS("rect", [
      ["id", "state_rect_" + cellIndex],
      ["x", startX + cellIndex * cellWidth],
      ["y", startY],
      ["width", cellWidth],
      ["height", cellHeight],
      ["rx", "10"],
      ["stroke", color],
      ["fill", isActive ? fillActive : fillInactive],
      ["stroke-width", strokeWidth],
    ]);
    canvas.appendChild(cell);

    // Create text for each cell
    const cellText = newElementNS("text", [
      ["id", "cell_text_" + cellIndex],
      ["x", startX + cellIndex * cellWidth + cellWidth / 2],
      ["y", startY + textOffsetY],
      ["text-anchor", "middle"],
      ["dominant-baseline", "middle"],
      ["fill", "#000"],
      ["font-size", fontSize],
      ["font-family", "Inter, sans-serif"],
    ]);
    cellText.textContent = str[cellIndex];
    canvas.appendChild(cellText);
  }

  // Draw current state display
  const state = newElementNS("rect", [
    ["id", "state_rect"],
    ["x", "10"],
    ["y", "10"],
    ["width", cellWidth],
    ["height", cellHeight],
    ["rx", "10"],
    ["stroke", color],
    ["fill", fillActive], // Make state box green
    ["stroke-width", strokeWidth],
  ]);
  canvas2.appendChild(state);

  // Create text for state display
  const textElem = newElementNS("text", [
    ["id", "state_text"],
    ["x", 10 + cellWidth / 2],
    ["y", 10 + textOffsetY],
    ["text-anchor", "middle"],
    ["dominant-baseline", "middle"],
    ["fill", "#000"],
    ["font-size", fontSize],
    ["font-family", "Inter, sans-serif"],
    ["font-weight", "bold"],
  ]);
  textElem.textContent = currentState;
  canvas2.appendChild(textElem);
}
