/**
 * Interactive Manual Tracing for DTM Simulation
 * Extension for manual interaction with the DTM
 */

// States for interactive mode
let expectedState = "";
let expectedWrite = "";
let expectedMove = "";
let attemptCount = 0;
let showingHint = false;

/**
 * Applies the best move automatically for the current step
 */
function applyBestMove() {
  if (stateIndex >= dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
    return;
  }
  
  // Apply the next step automatically
  stateIndex++;
  inputPointer = stateIndex;
  refreshInput();
  refreshCanvas();
  
  // Add step to the trace
  const prevState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex - 1];
  const currState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
  
  let str = `✓ Auto Move: State: ${prevState[2]} → ${currState[2]}, `;
  str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
  
  if (prevState[1] > currState[1]) {
    str += "Move Left";
  } else if (prevState[1] < currState[1]) {
    str += "Move Right";
  } else {
    str += "Stay";
  }
  
  addToStack(str, 'auto');
  
  // Update easy mode button states if in easy mode
  if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy' && typeof updateEasyModeButtonStates === 'function') {
    updateEasyModeButtonStates();
  }
  
  // Check if we've reached the end
  const currCell = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][0][
    dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][1]
  ];
  
  if (stateIndex === dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
    // Final state reached - determine acceptance or rejection
    if (currCell === "S") {
      swal({
        title: "Input Accepted!",
        text: "The DTM has accepted the input string.",
        icon: "success",
        button: {
          text: "Continue",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      });
    } else {
      swal({
        title: "Input Rejected",
        text: "The DTM has rejected the input string.",
        icon: "error",
        button: {
          text: "Continue",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      });
    }
  } else {
    // Update choices for the next step
    updateInteractiveChoices();
    
    // Update easy mode button states if in easy mode
    if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy' && typeof updateEasyModeButtonStates === 'function') {
      updateEasyModeButtonStates();
    }
  }
}

/**
 * Updates the available choices for the user based on current tape symbol
 */
function updateInteractiveChoices() {
  // Don't update interactive choices in Easy Mode
  if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy') {
    return;
  }
  
  // Check if we have valid data
  if (!dtm || !dtm[dtmIndex] || !dtm[dtmIndex]["input"] || !dtm[dtmIndex]["input"][inputIndex] || !dtm[dtmIndex]["input"][inputIndex]["states"]) {
    return;
  }
  
  const states = dtm[dtmIndex]["input"][inputIndex]["states"];
  
  // Don't show choices if we're at the final state
  if (stateIndex >= states.length - 1) {
    return;
  }
  
  // Get current state information
  const currentState = states[stateIndex];
  const currentStateId = currentState[2]; // e.g., "q0"
  const currentSymbol = currentState[0][currentState[1]]; // Current symbol under the head
  
  // Get next state information to determine expected values
  const nextState = states[stateIndex + 1];
  expectedState = nextState[2];
  expectedWrite = nextState[0][currentState[1]];
  
  // Determine expected direction
  if (currentState[1] < nextState[1]) {
    expectedMove = "R";
  } else if (currentState[1] > nextState[1]) {
    expectedMove = "L";
  } else {
    expectedMove = "S"; // Stay in place
  }
  
  // Reset DOM elements
  const interactiveControls = document.getElementById("interactive_controls");
  if (!interactiveControls) {
    setTimeout(() => updateInteractiveChoices(), 100);
    return;
  }
  
  // Get and clear existing options
  const stateSelect = document.getElementById("state_select");
  const writeSelect = document.getElementById("write_select");
  const moveSelect = document.getElementById("move_select");
  
  if (!stateSelect || !writeSelect || !moveSelect) {
    setTimeout(() => updateInteractiveChoices(), 100);
    return;
  }
  
  stateSelect.innerHTML = "";
  writeSelect.innerHTML = "";
  moveSelect.innerHTML = "";
  
  // Add a blank default option first
  const defaultStateOption = document.createElement("option");
  defaultStateOption.value = "";
  defaultStateOption.textContent = "-- Select Next State --";
  stateSelect.appendChild(defaultStateOption);
  
  const defaultWriteOption = document.createElement("option");
  defaultWriteOption.value = "";
  defaultWriteOption.textContent = "-- Select Symbol to Write --";
  writeSelect.appendChild(defaultWriteOption);
  
  const defaultMoveOption = document.createElement("option");
  defaultMoveOption.value = "";
  defaultMoveOption.textContent = "-- Select Move Direction --";
  moveSelect.appendChild(defaultMoveOption);
  
  // Show current state and symbol information
  const currentInfoDiv = document.getElementById("current_state_info");
  if (currentInfoDiv) {
    currentInfoDiv.innerHTML = `
      <div><strong>Current State:</strong> ${currentStateId}</div>
      <div><strong>Reading Symbol:</strong> "${currentSymbol}"</div>
    `;
  }
  
  // Add all possible states
  const allStates = Object.keys(dtm[dtmIndex]["transition"]);
  allStates.forEach(state => {
    const stateOption = document.createElement("option");
    stateOption.value = state;
    stateOption.textContent = state;
    stateSelect.appendChild(stateOption);
  });
  
  // Add all possible symbols
  const alphabet = ["B", "0", "1", "X", "Y", "Z", "S"];
  alphabet.forEach(symbol => {
    const writeOption = document.createElement("option");
    writeOption.value = symbol;
    writeOption.textContent = symbol;
    writeSelect.appendChild(writeOption);
  });
  
  // Add all possible directions
  const directions = [
    { value: "R", text: "Right" },
    { value: "L", text: "Left" },
    { value: "S", text: "Stay" }
  ];
  
  directions.forEach(dir => {
    const moveOption = document.createElement("option");
    moveOption.value = dir.value;
    moveOption.textContent = dir.text;
    moveSelect.appendChild(moveOption);
  });
  
  // Reset attempt count when updating choices
  attemptCount = 0;
  showingHint = false;
  
  // Enable all controls
  document.getElementById("apply_move").disabled = false;
  const hintButton = document.getElementById("show_hint");
  if (hintButton) hintButton.disabled = false;
  const bestMoveButton = document.getElementById("best_move");
  if (bestMoveButton) bestMoveButton.disabled = false;
}

/**
 * Applies the user-selected move in interactive mode
 */
function applyInteractiveMove() {
  if (stateIndex >= dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
    return;
  }
  
  const selectedState = document.getElementById("state_select").value;
  const selectedWrite = document.getElementById("write_select").value;
  const selectedMove = document.getElementById("move_select").value;
  
  // Validate that all selections have been made
  if (!selectedState || !selectedWrite || !selectedMove) {
    swal({
      title: "Incomplete Move",
      text: "Please select a next state, write symbol, and move direction to continue.",
      icon: "warning",
      button: {
        text: "OK",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    return;
  }
  
  // Check if the selection matches the expected next step
  const isCorrect = (
    selectedState === expectedState &&
    selectedWrite === expectedWrite &&
    selectedMove === expectedMove
  );
  
  // Increment attempt count
  attemptCount++;
  
  if (isCorrect) {
    // If correct, proceed to the next step
    stateIndex++;
    inputPointer = stateIndex;
    refreshInput();
    refreshCanvas();
    
    // Add step to the trace with a success indicator
    const prevState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex - 1];
    const currState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
    
    let str = `✓ Correct! State: ${prevState[2]} → ${currState[2]}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
    
    if (prevState[1] > currState[1]) {
      str += "Move Left";
    } else if (prevState[1] < currState[1]) {
      str += "Move Right";
    } else {
      str += "Stay";
    }
    
    addToStack(str, 'correct');
    
    // Update easy mode button states if in easy mode
    if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy' && typeof updateEasyModeButtonStates === 'function') {
      updateEasyModeButtonStates();
    }
    
    // Show success message with different messages based on attempt count
    let successMsg = "Great job! That's the correct move.";
    if (attemptCount === 1) {
      successMsg += " You got it on the first try!";
    }
    
    swal({
      title: "Correct Move!",
      text: successMsg,
      icon: "success",
      button: {
        text: "Continue",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    
    // Check if we've reached the end
    const currCell = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][0][
      dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][1]
    ];
    
    if (stateIndex === dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
      // Final state reached - determine acceptance or rejection
      setTimeout(() => {
        if (currCell === "S") {
          swal({
            title: "Input Accepted!",
            text: "Congratulations! You've successfully traced through the DTM, and it accepted the input string.",
            icon: "success",
            button: {
              text: "Continue",
              className: "swal-button--confirm"
            },
            className: "gradient-modal"
          });
        } else {
          swal({
            title: "Input Rejected",
            text: "You've successfully traced through the DTM, but it rejected the input string.",
            icon: "error",
            button: {
              text: "Continue",
              className: "swal-button--confirm"
            },
            className: "gradient-modal"
          });
        }
      }, 1000);
    } else {
      // Update choices for the next step
      updateInteractiveChoices();
    }
  } else {
    // If incorrect, show error message with guidance
    let errorMessage = "That's not the correct move. ";
    
    // Create a detailed explanation of what went wrong
    let incorrectItems = [];
    if (selectedState !== expectedState) {
      incorrectItems.push(`Next state should be <strong>${expectedState}</strong>`);
    }
    if (selectedWrite !== expectedWrite) {
      incorrectItems.push(`Write symbol should be <strong>${expectedWrite}</strong>`);
    }
    if (selectedMove !== expectedMove) {
      incorrectItems.push(`Move direction should be <strong>${expectedMove === "R" ? "Right" : expectedMove === "L" ? "Left" : "Stay"}</strong>`);
    }
    
    // Add step to the trace with an error indicator
    const prevState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
    let str = `✗ Incorrect: State: ${prevState[2]} → ${selectedState}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${selectedWrite}", `;
    str += selectedMove === "R" ? "Move Right" : selectedMove === "L" ? "Move Left" : "Stay";
    
    addToStack(str, 'incorrect');
    
    // On first attempt, don't show the correct answer
    if (attemptCount === 1) {
      errorMessage += "Try again!";
      
      swal({
        title: "Incorrect Move",
        text: errorMessage,
        icon: "warning",
        button: {
          text: "Try Again",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      });
    } 
    // On second attempt, give a hint
    else if (attemptCount === 2) {
      errorMessage += "Here's a hint: " + incorrectItems[0];
      
      swal({
        title: "Still Incorrect",
        text: errorMessage,
        icon: "warning",
        button: {
          text: "Try Once More",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      });
    }
    // On third attempt, show the correct answer
    else {
      let correctAnswer = `The correct move is: <br><br>`;
      correctAnswer += `• Next State: <strong>${expectedState}</strong><br>`;
      correctAnswer += `• Write Symbol: <strong>${expectedWrite}</strong><br>`;
      correctAnswer += `• Move Direction: <strong>${expectedMove === "R" ? "Right" : expectedMove === "L" ? "Left" : "Stay"}</strong><br><br>`;
      correctAnswer += `Let's apply the correct move and continue.`;
      
      swal({
        title: "Learning Opportunity",
        content: {
          element: "div",
          attributes: {
            innerHTML: correctAnswer
          }
        },
        icon: "info",
        button: {
          text: "Apply Correct Move",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      }).then(() => {
        // Automatically advance with the correct move
        stateIndex++;
        inputPointer = stateIndex;
        refreshInput();
        refreshCanvas();
        
        // Add the correct step to the trace
        const prevState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex - 1];
        const currState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
        
        let str = `✓ Correction: State: ${prevState[2]} → ${currState[2]}, `;
        str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
        
        if (prevState[1] > currState[1]) {
          str += "Move Left";
        } else if (prevState[1] < currState[1]) {
          str += "Move Right";
        } else {
          str += "Stay";
        }
        
        addToStack(str, 'correction');
        
        // Update for next step
        updateInteractiveChoices();
      });
    }
  }
}

/**
 * Shows a hint for the current step
 */
function showHint() {
  if (showingHint) return;
  
  showingHint = true;
  
  // Determine which hint to show based on attempt count
  let hintText = "";
  if (attemptCount === 0) {
    // Basic hint on first click
    hintText = `Look at the current state and symbol, then check the transition table to find the correct move.`;
  } else {
    // More specific hint after attempts
    const currentState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
    const currentStateId = currentState[2];
    const currentSymbol = currentState[0][currentState[1]];
    
    hintText = `When in state <strong>${currentStateId}</strong> reading symbol <strong>"${currentSymbol}"</strong>, the DTM should `;
    
    // Give progressively more detailed hints
    if (attemptCount === 1) {
      hintText += `move to state <strong>${expectedState}</strong>.`;
    } else {
      hintText += `move to state <strong>${expectedState}</strong>, write <strong>"${expectedWrite}"</strong>, and move ${expectedMove === "R" ? "<strong>Right</strong>" : expectedMove === "L" ? "<strong>Left</strong>" : "<strong>Stay</strong>"}.`;
    }
  }
  
  swal({
    title: "Hint",
    content: {
      element: "div",
      attributes: {
        innerHTML: hintText
      }
    },
    icon: "info",
    button: {
      text: "Got It",
      className: "swal-button--confirm"
    },
    className: "gradient-modal"
  }).then(() => {
    // Reset the showingHint flag when the modal is closed
    showingHint = false;
  });
}

/**
 * Creates interactive controls if they don't exist
 */
function createInteractiveControls() {
  // Don't create controls in Easy Mode
  if (typeof getCurrentMode === 'function' && getCurrentMode() === 'easy') {
    return;
  }
  
  // Check if controls already exist
  if (document.getElementById("interactive_controls")) {
    return;
  }
  
  // Create the interactive controls container
  const interactiveControls = document.createElement("div");
  interactiveControls.id = "interactive_controls";
  interactiveControls.className = "interactive-controls";
  interactiveControls.style.display = "block";
  
  // Add current state info section
  interactiveControls.innerHTML = `
    <div class="hard-mode-instruction">
      Use the dropdown controls below to manually select state, symbol, and action
    </div>
    
    <div id="current_state_info" class="current-state-info">
      <!-- Will be populated dynamically -->
    </div>
    
    <div class="control-row">
      <div class="control-group">
        <label for="state_select">Next State:</label>
        <select id="state_select"></select>
      </div>
      <div class="control-group">
        <label for="write_select">Write Symbol:</label>
        <select id="write_select"></select>
      </div>
      <div class="control-group">
        <label for="move_select">Move Direction:</label>
        <select id="move_select"></select>
      </div>
    </div>
    
    <div class="button-row">
      <button id="apply_move" class="button green">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        Apply Move
      </button>
      <button id="show_hint" class="button blue">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
        Show Hint
      </button>
    </div>
  `;
  
  // Add the interactive controls after the transition table
  const transitionTableContainer = document.querySelector(".transition-table-container");
  transitionTableContainer.parentNode.insertBefore(interactiveControls, null);
  
  // Add event listeners for the buttons
  document.getElementById("apply_move").addEventListener("click", applyInteractiveMove);
  document.getElementById("show_hint").addEventListener("click", showHint);
}

/**
 * Forces initialization of interactive controls
 */
function forceInitializeInteractiveControls() {
  // Ensure controls exist
  if (!document.getElementById("interactive_controls")) {
    createInteractiveControls();
    setTimeout(forceInitializeInteractiveControls, 100);
    return;
  }
  
  const stateSelect = document.getElementById("state_select");
  const writeSelect = document.getElementById("write_select");
  const moveSelect = document.getElementById("move_select");
  
  if (!stateSelect || !writeSelect || !moveSelect) {
    setTimeout(forceInitializeInteractiveControls, 100);
    return;
  }
  
  // Clear and populate state select
  stateSelect.innerHTML = "";
  const defaultStateOption = document.createElement("option");
  defaultStateOption.value = "";
  defaultStateOption.textContent = "-- Select Next State --";
  stateSelect.appendChild(defaultStateOption);
  
  if (dtm && dtm[dtmIndex] && dtm[dtmIndex]["transition"]) {
    const allStates = Object.keys(dtm[dtmIndex]["transition"]);
    allStates.forEach(state => {
      const stateOption = document.createElement("option");
      stateOption.value = state;
      stateOption.textContent = state;
      stateSelect.appendChild(stateOption);
    });
  }
  
  // Clear and populate write select
  writeSelect.innerHTML = "";
  const defaultWriteOption = document.createElement("option");
  defaultWriteOption.value = "";
  defaultWriteOption.textContent = "-- Select Symbol to Write --";
  writeSelect.appendChild(defaultWriteOption);
  
  const alphabet = ["B", "0", "1", "X", "Y", "Z", "S"];
  alphabet.forEach(symbol => {
    const writeOption = document.createElement("option");
    writeOption.value = symbol;
    writeOption.textContent = symbol;
    writeSelect.appendChild(writeOption);
  });
  
  // Clear and populate move select
  moveSelect.innerHTML = "";
  const defaultMoveOption = document.createElement("option");
  defaultMoveOption.value = "";
  defaultMoveOption.textContent = "-- Select Move Direction --";
  moveSelect.appendChild(defaultMoveOption);
  
  const directions = [
    { value: "R", text: "Right" },
    { value: "L", text: "Left" },
    { value: "S", text: "Stay" }
  ];
  
  directions.forEach(dir => {
    const moveOption = document.createElement("option");
    moveOption.value = dir.value;
    moveOption.textContent = dir.text;
    moveSelect.appendChild(moveOption);
  });
  
  // Update current state info
  const currentInfoDiv = document.getElementById("current_state_info");
  if (currentInfoDiv && dtm && dtm[dtmIndex] && dtm[dtmIndex]["input"] && dtm[dtmIndex]["input"][inputIndex]) {
    const states = dtm[dtmIndex]["input"][inputIndex]["states"];
    if (states && states[stateIndex]) {
      const currentState = states[stateIndex];
      const currentStateId = currentState[2];
      const currentSymbol = currentState[0][currentState[1]];
      
      currentInfoDiv.innerHTML = `
        <div><strong>Current State:</strong> ${currentStateId}</div>
        <div><strong>Reading Symbol:</strong> "${currentSymbol}"</div>
      `;
    }
  }
}

// Initialize interactive mode when the window loads
window.addEventListener("load", function() {
  // Wait for main initialization to complete
  setTimeout(() => {
    // Create the interactive controls
    createInteractiveControls();
    
    // Create the "Apply Best Move" button
    const bestMoveButton = document.createElement("button");
    bestMoveButton.id = "best_move";
    bestMoveButton.className = "button purple";
    bestMoveButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      Apply Best Move
    `;
    bestMoveButton.addEventListener("click", applyBestMove);
    
    // Add the button to the controls
    const controlsContainer = document.querySelector(".horizontal-controls");
    controlsContainer.appendChild(bestMoveButton);
    
    // Disable the next button since we'll handle it with manual input
    const nextButton = document.getElementById("next");
    if (nextButton) {
      nextButton.disabled = true;
      nextButton.onclick = null; // Will be handled by interactive controls
    }
    
    // Initialize based on current mode
    setTimeout(() => {
      if (typeof getCurrentMode === 'function' && getCurrentMode() === 'hard') {
        forceInitializeInteractiveControls();
      }
    }, 50); // Additional small delay to ensure everything is ready
  }, 200); // Increased delay to ensure main.js initialization completes
  
  // Add keyboard shortcuts for interactive mode
  document.addEventListener("keydown", function(event) {
    if (!event.repeat) {
      if (event.key === "Enter") {
        // Apply move with Enter
        document.getElementById("apply_move")?.click();
        event.preventDefault();
      } else if (event.key === "h" || event.key === "H") {
        // Show hint with H key
        document.getElementById("show_hint")?.click();
        event.preventDefault();
      } else if (event.key === "b" || event.key === "B") {
        // Apply best move with B key
        document.getElementById("best_move")?.click();
        event.preventDefault();
      }
    }
  });
  
  // Show welcome message for first-time users (only in hard mode)
  setTimeout(() => {
    if (typeof getCurrentMode === 'function' && getCurrentMode() === 'hard') {
      swal({
        title: "Welcome to Interactive DTM Simulation!",
        text: "You control the DTM simulation step by step. Choose the next state, write symbol, and move direction at each step. Don't worry about making mistakes - they're part of learning! If you get stuck, you can use the 'Apply Best Move' button to see the correct next move.",
        icon: "info",
        button: {
          text: "Let's Start!",
          className: "swal-button--confirm"
        },
        className: "gradient-modal"
      });
    }
  }, 500);
});
