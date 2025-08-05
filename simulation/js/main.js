/**
 * Main logic for DTM simulation
 */

// Global variables
let width = 500;
let height = 200;
let radius = 25;

let dtmIndex = 0;
let stateIndex = 0;
let inputIndex = 0;
let inputPointer = -1;

// DOM elements
let canvas, canvas2;

/**
 * Refreshes the canvas visualization
 */
function refreshCanvas() {
  clearElem(canvas);
  clearElem(canvas2);

  let curr = "";
  if (inputPointer !== -1) {
    curr = dtm[dtmIndex]["input"][inputIndex]["states"][inputPointer];
  }

  // Update DTM description
  const DTMDescriptionContainer = document.getElementById("DTM_description_container");
  clearElem(DTMDescriptionContainer);

  const descriptionHeading = document.createElement("h3");
  descriptionHeading.className = "gradient-text";
  descriptionHeading.innerText = dtm[dtmIndex]["description"];
  DTMDescriptionContainer.appendChild(descriptionHeading);

  // Display the tape and state
  displayCanvas(canvas, canvas2, dtm[dtmIndex], inputIndex, stateIndex);
}

/**
 * Resets the input to initial state
 */
function resetInput() {
  inputIndex = 0;
  stateIndex = 0;
  inputPointer = -1;
  
  // Initialize UI to match the reset state
  resetStack();
  updateUIForCurrentState();
  updateButtonStates();

  refreshInput();
  
  // Update mode-specific interfaces
  if (typeof getCurrentMode === 'function') {
    const currentMode = getCurrentMode();
    if (currentMode === 'easy') {
      if (typeof updateEasyModeInterface === 'function') {
        updateEasyModeInterface();
      }
      if (typeof updateEasyModeButtonStates === 'function') {
        updateEasyModeButtonStates();
      }
    }
  }
}

/**
 * Refreshes the input display
 */
function refreshInput() {
  const inputContent = document.getElementById("input_content");
  clearElem(inputContent);

  // Get the current input string
  const inputString = dtm[dtmIndex]["input"][inputIndex]["string"];

  // Iterate over the string and dynamically style each character
  for (let i = 0; i < inputString.length; i++) {
    // Create a span element for the character with proper styling
    const span = document.createElement("span");
    span.id = "text_" + i;
    span.innerText = inputString[i];
    
    // Highlight current position
    if (inputPointer === i) {
      span.style.color = "#EF4444"; // Red for active position
      span.style.fontWeight = "bold";
    } else {
      span.style.color = "#1E293B"; // Dark gray for other positions
    }
    
    // Append to container
    inputContent.appendChild(span);
  }
}

/**
 * Resets the steps display
 */
function resetStack() {
  const stack = document.getElementById("stack_list");
  clearElem(stack);
}

/**
 * Adds a step to the steps display
 * @param {string} str - Step description
 * @param {string} className - Optional CSS class to apply to the list item
 */
function addToStack(str, className = '') {
  const stack = document.getElementById("stack_list");
  const listElem = document.createElement("li");
  listElem.innerText = str;
  
  // Apply optional class for styling (used by interactive mode)
  if (className) {
    listElem.classList.add(className);
  }
  
  // Add the step at the top with bold styling
  if (stack.firstChild) {
    stack.firstChild.classList.remove("active");
    stack.insertBefore(listElem, stack.firstChild);
  } else {
    stack.appendChild(listElem);
  }
  listElem.classList.add("active");
}

/**
 * Removes the top step from the steps display
 */
function removeFromStack() {
  const stack = document.getElementById("stack_list");
  if (stack.firstChild) {
    stack.removeChild(stack.firstChild);

    if (stack.firstChild) {
      stack.firstChild.classList.add("active");
    }
  }
}

/**
 * Updates the transition table display
 */
function updateTransitions() {
  // Check current mode and delegate accordingly
  if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy') {
    if (typeof updateTransitionTableForEasyMode === 'function') {
      updateTransitionTableForEasyMode();
    }
    return;
  }
  
  // Original hard mode transition table
  const transitionTable = document.getElementById("transition_table_container");
  if (!transitionTable) {
    console.error('transition_table_container not found in updateTransitions');
    return;
  }
  
  if (typeof clearElem === 'function') {
    clearElem(transitionTable);
  } else {
    transitionTable.innerHTML = '';
  }

  // Create table element
  const table = document.createElement("table");
  table.className = "transition-table";

  // Create header row
  const headerRow = document.createElement("tr");
  
  // Add "State" header
  const stateHeader = document.createElement("th");
  stateHeader.innerText = "State";
  headerRow.appendChild(stateHeader);
  
  // Add input symbol headers
  Object.keys(dtm[dtmIndex]["transition"]["q0"]).forEach(function(keyName) {
    const th = document.createElement("th");
    th.innerText = keyName;
    headerRow.appendChild(th);
  });
  
  table.appendChild(headerRow);

  // Add rows for each state
  Object.keys(dtm[dtmIndex]["transition"]).forEach(function(stateName) {
    const row = document.createElement("tr");
    
    // Add state name cell
    const stateCell = document.createElement("td");
    stateCell.innerText = stateName;
    row.appendChild(stateCell);
    
    // Add cells for transitions
    Object.keys(dtm[dtmIndex]["transition"][stateName]).forEach(function(keyName) {
      const cell = document.createElement("td");
      cell.innerText = dtm[dtmIndex]["transition"][stateName][keyName];
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });

  transitionTable.appendChild(table);
}

/**
 * Updates UI elements based on current state
 */
function updateUIForCurrentState() {
  refreshInput();
  refreshCanvas();
  
  // Update based on current mode
  if (typeof getCurrentMode === 'function') {
    const currentMode = getCurrentMode();
    
    if (currentMode === 'easy') {
      // Update easy mode interface
      if (typeof updateEasyModeInterface === 'function') {
        updateEasyModeInterface();
      }
      if (typeof updateEasyModeButtonStates === 'function') {
        updateEasyModeButtonStates();
      }
    } else {
      // Update hard mode interactive controls
      if (typeof forceInitializeInteractiveControls === 'function') {
        forceInitializeInteractiveControls();
      }
    }
  } else {
    // Fallback to hard mode
    if (typeof forceInitializeInteractiveControls === 'function') {
      forceInitializeInteractiveControls();
    }
  }
}

/**
 * Updates button states based on current position
 */
function updateButtonStates() {
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  
  if (prev) {
    // Always enable Previous button - let the click handler determine if it can actually go back
    prev.disabled = false;
    prev.style.opacity = 1;
    prev.style.cursor = "pointer";
  }
  
  // Hide the Next Step button in both modes
  if (next) {
    next.style.display = 'none';
  }
}

/**
 * Initializes the application
 */
window.addEventListener("load", function() {
  // Get canvas elements
  canvas = document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2");

  // Initialize displays
  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();
  updateButtonStates();
  
  // Custom function to adjust step list scrollbar behavior
  const adjustStepsList = function() {
    const traceContainer = document.querySelector('.trace-container');
    const stackList = document.getElementById('stack_list');
    if (stackList && traceContainer) {
      // Only show scrollbar if content exceeds container height
      traceContainer.style.overflowY = stackList.scrollHeight > traceContainer.clientHeight ? 'auto' : 'hidden';
    }
  };
  
  // Run initially and after any step changes
  adjustStepsList();
  // Monitor for DOM changes in the stack list
  const observer = new MutationObserver(adjustStepsList);
  observer.observe(document.getElementById('stack_list'), { childList: true, subtree: true });
  
  // Initialize interactive controls if available
  setTimeout(() => {
    if (typeof forceInitializeInteractiveControls === 'function') {
      forceInitializeInteractiveControls();
    }
    updateButtonStates(); // Make sure buttons are updated after controls are initialized
  }, 400); // Longer delay to ensure everything is ready

  // Event listener for changing DTM
  const changeDTM = document.getElementById("change_dtm");
  changeDTM.addEventListener("click", function() {
    clearElem(canvas);
    dtmIndex = (dtmIndex + 1) % dtm.length;
    resetInput();
    refreshCanvas();
    resetStack();
    updateTransitions();
    
    // Refresh easy mode table if in easy mode
    if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy' && typeof updateTransitionTableForEasyMode === 'function') {
      updateTransitionTableForEasyMode();
    }
  });

  // Event listener for changing input
  const changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function() {
    inputIndex = (inputIndex + 1) % dtm[dtmIndex]["input"].length;
    stateIndex = 0;
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
    resetStack();
    
    // Refresh easy mode table if in easy mode
    if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy' && typeof updateTransitionTableForEasyMode === 'function') {
      updateTransitionTableForEasyMode();
    }
  });

  // Next Step button is hidden - event listener removed

  // Event listener for previous step
  const prev = document.getElementById("prev");
  if (prev) {
    prev.addEventListener("click", function() {
      // Check if we can actually go back
      const stackList = document.getElementById("stack_list");
      const hasSteps = stackList && stackList.children.length > 1;
      
      if (hasSteps && stateIndex > 0) {
        // Get the previous state data
        stateIndex--;
        
        // Extract the correct tape head position for this state
        const currentState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
        if (currentState) {
          // Position 1 in the state array is the tape head position
          inputPointer = currentState[1];
        }
        
        // Update UI based on current state
        updateUIForCurrentState();
        removeFromStack();
        
        // Update easy mode button states if in easy mode
        if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy' && typeof updateEasyModeButtonStates === 'function') {
          updateEasyModeButtonStates();
        }
        updateButtonStates();
      }
    });
  }
});
