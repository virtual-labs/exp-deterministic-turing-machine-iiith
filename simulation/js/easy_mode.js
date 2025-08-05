/**
 * Easy Mode Implementation
 * Provides interactive transition table where users click buttons instead of dropdowns
 */

// Easy mode state variables
let availableTransitions = [];

/**
 * Show Easy Mode Interface
 */
function showEasyModeInterface() {
  // Easy Mode interface is now handled entirely by the transition table
  // No separate container needed
  
  // Automatically start the simulation if not already started
  if (inputPointer === -1) {
    startEasyModeSimulation();
  }
  
  // Update the interface based on current state
  updateEasyModeInterface();
  
  // Update button states to ensure correct buttons are enabled
  setTimeout(() => {
    updateEasyModeButtonStates();
  }, 100);
}

/**
 * Hide Easy Mode Interface
 */
function hideEasyModeInterface() {
  // Easy Mode interface is now handled entirely by the transition table
  // No separate container to hide
}

/**
 * Update Easy Mode Interface
 */
function updateEasyModeInterface() {
  // Calculate available transitions based on current state
  calculateAvailableTransitions();
  
  // Refresh button states to ensure correct buttons are enabled
  refreshEasyModeButtonStates();
}

/**
 * Calculate which transitions are available from current state
 */
function calculateAvailableTransitions() {
  availableTransitions = [];
  
  if (stateIndex >= dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
    return; // No more transitions available
  }
  
  const states = dtm[dtmIndex]["input"][inputIndex]["states"];
  const currentState = states[stateIndex];
  const nextState = states[stateIndex + 1];
  
  const currentStateId = currentState[2];
  const currentSymbol = currentState[0][currentState[1]];
  const nextStateId = nextState[2];
  const nextSymbol = nextState[0][currentState[1]];
  
  // Determine direction
  let direction = "S";
  if (currentState[1] < nextState[1]) {
    direction = "R";
  } else if (currentState[1] > nextState[1]) {
    direction = "L";
  }
  
  // The correct transition
  const correctTransition = {
    fromState: currentStateId,
    symbol: currentSymbol,
    toState: nextStateId,
    write: nextSymbol,
    move: direction,
    isCorrect: true
  };
  
  availableTransitions.push(correctTransition);
  
  // Add some decoy transitions from the same state with same symbol
  const transitions = dtm[dtmIndex]["transition"];
  if (transitions[currentStateId] && transitions[currentStateId][currentSymbol]) {
    // This represents all possible transitions from current state with current symbol
    // But since DTM is deterministic, there should only be one
    // We'll add some plausible alternatives for educational purposes
    
    const allStates = Object.keys(transitions);
    const allSymbols = ["B", "0", "1", "X", "Y", "Z", "S"];
    const allMoves = ["L", "R", "S"];
    
    // Add a few incorrect but plausible transitions
    for (let i = 0; i < 2; i++) {
      const randomState = allStates[Math.floor(Math.random() * allStates.length)];
      const randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      
      // Make sure it's different from the correct one
      if (randomState !== nextStateId || randomSymbol !== nextSymbol || randomMove !== direction) {
        availableTransitions.push({
          fromState: currentStateId,
          symbol: currentSymbol,
          toState: randomState,
          write: randomSymbol,
          move: randomMove,
          isCorrect: false
        });
      }
    }
  }
}

/**
 * Update transition table for easy mode (make it interactive)
 */
function updateTransitionTableForEasyMode() {
  const transitionTable = document.getElementById("transition_table_container");
  if (!transitionTable) {
    console.error('transition_table_container not found');
    return;
  }
  
  // Check if DTM data is available
  if (!dtm || !dtm[dtmIndex] || !dtm[dtmIndex]["transition"]) {
    console.error('DTM data not available');
    return;
  }
  
  // Clear existing content
  if (typeof clearElem === 'function') {
    clearElem(transitionTable);
  } else {
    transitionTable.innerHTML = '';
  }

  // Create interactive table
  const table = document.createElement("table");
  table.className = "interactive-transition-table";
  table.id = "easy-mode-transition-table";

  // Create header row
  const headerRow = document.createElement("tr");
  
  const stateHeader = document.createElement("th");
  stateHeader.innerText = "State";
  headerRow.appendChild(stateHeader);
  
  // Add input symbol headers
  const firstState = Object.keys(dtm[dtmIndex]["transition"])[0];
  if (!dtm[dtmIndex]["transition"][firstState]) {
    console.error('No transition data found for first state');
    return;
  }
  
  Object.keys(dtm[dtmIndex]["transition"][firstState]).forEach(function(symbol) {
    const th = document.createElement("th");
    th.innerText = symbol;
    headerRow.appendChild(th);
  });
  
  table.appendChild(headerRow);

  // Add rows for each state
  Object.keys(dtm[dtmIndex]["transition"]).forEach(function(stateName) {
    const row = document.createElement("tr");
    row.dataset.stateName = stateName; // Add state identifier to row
    
    // Add state name cell
    const stateCell = document.createElement("td");
    stateCell.className = "state-cell";
    stateCell.innerText = stateName;
    row.appendChild(stateCell);
    
    // Add cells for transitions
    Object.keys(dtm[dtmIndex]["transition"][stateName]).forEach(function(symbol) {
      const cell = document.createElement("td");
      const transitionData = dtm[dtmIndex]["transition"][stateName][symbol];
      
      // Handle the transition data - it's always an array
      let transitionString = "";
      if (Array.isArray(transitionData) && transitionData.length > 0) {
        transitionString = transitionData[0]; // Take the first (and usually only) transition
      }
      
      if (transitionString && transitionString !== "" && transitionString !== "HALT") {
        // Create button for this transition
        const button = document.createElement("button");
        button.className = "transition-button disabled"; // Start as disabled
        button.innerText = transitionString;
        button.dataset.fromState = stateName;
        button.dataset.symbol = symbol;
        button.dataset.transition = transitionString;
        
        // Parse transition string to get components
        // Remove parentheses and split by comma: (q1,X,R) -> q1,X,R
        const cleanString = transitionString.replace(/[\(\)]/g, '');
        const parts = cleanString.split(',');
        if (parts.length === 3) {
          button.dataset.toState = parts[0];
          button.dataset.write = parts[1];
          button.dataset.move = parts[2];
        }
        
        // Add click handler
        button.addEventListener('click', () => handleEasyModeTransitionClick(button));
        
        cell.appendChild(button);
      } else if (transitionString === "HALT") {
        // HALT transition
        const haltButton = document.createElement("button");
        haltButton.className = "transition-button disabled";
        haltButton.innerText = "HALT";
        haltButton.dataset.fromState = stateName;
        haltButton.dataset.symbol = symbol;
        haltButton.dataset.transition = "HALT";
        haltButton.disabled = true;
        cell.appendChild(haltButton);
      } else {
        // Empty transition - show dash
        const emptySpan = document.createElement("span");
        emptySpan.className = "empty-transition";
        emptySpan.innerText = "-";
        emptySpan.style.color = "#9ca3af";
        cell.appendChild(emptySpan);
      }
      
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });

  transitionTable.appendChild(table);
  
  // Initialize button states for the current simulation state
  refreshEasyModeButtonStates();
}

/**
 * Completely refresh button states based on current simulation state
 */
function refreshEasyModeButtonStates() {
  // Get the current state of the simulation
  const currentSimulationState = getCurrentSimulationState();
  
  // Update all buttons based on this state
  updateEasyModeButtonsForState(currentSimulationState);
}

/**
 * Get the current state of the simulation
 */
function getCurrentSimulationState() {
  // Check if we have valid DTM data
  if (!dtm || !dtm[dtmIndex] || !dtm[dtmIndex]["input"] || !dtm[dtmIndex]["input"][inputIndex]) {
    return {
      isValid: false,
      currentStateId: null,
      isAtEnd: true,
      isStarted: false
    };
  }
  
  const states = dtm[dtmIndex]["input"][inputIndex]["states"];
  if (!states || states.length === 0) {
    return {
      isValid: false,
      currentStateId: null,
      isAtEnd: true,
      isStarted: false
    };
  }
  
  // Determine current state based on stateIndex and inputPointer
  let currentStateId = null;
  let isStarted = inputPointer >= 0 && stateIndex >= 0;
  let isAtEnd = false;
  
  if (isStarted && stateIndex < states.length) {
    const currentState = states[stateIndex];
    currentStateId = currentState[2]; // State ID is at index 2
    isAtEnd = stateIndex >= states.length - 1;
  } else if (states.length > 0) {
    // Not started yet, use initial state
    const initialState = states[0];
    currentStateId = initialState[2];
    isStarted = false;
    isAtEnd = false;
  }
  
  return {
    isValid: true,
    currentStateId: currentStateId,
    isAtEnd: isAtEnd,
    isStarted: isStarted
  };
}

/**
 * Update button states for a specific simulation state
 */
function updateEasyModeButtonsForState(simulationState) {
  const buttons = document.querySelectorAll('#easy-mode-transition-table .transition-button');
  
  if (!simulationState.isValid || simulationState.isAtEnd) {
    // Invalid state or at end - disable all buttons
    buttons.forEach(button => {
      button.className = 'transition-button disabled';
      button.disabled = true;
    });
    return;
  }
  
  if (!simulationState.currentStateId) {
    // No current state - disable all buttons
    buttons.forEach(button => {
      button.className = 'transition-button disabled';
      button.disabled = true;
    });
    return;
  }
  
  // Enable buttons for the current state, disable all others
  buttons.forEach(button => {
    const fromState = button.dataset.fromState;
    
    if (fromState === simulationState.currentStateId) {
      // Enable all buttons in the current state's row
      button.className = 'transition-button available';
      button.disabled = false;
    } else {
      // Disable buttons not in the current state's row
      button.className = 'transition-button disabled';
      button.disabled = true;
    }
  });
}

/**
 * Handle transition button click in easy mode
 */
function handleEasyModeTransitionClick(button) {
  if (button.disabled) return;
  
  const fromState = button.dataset.fromState;
  const symbol = button.dataset.symbol;
  const toState = button.dataset.toState;
  const write = button.dataset.write;
  const move = button.dataset.move;
  
  // Check if this is the correct transition
  const isCorrect = isCorrectTransition(fromState, symbol, toState, write, move);
  
  if (isCorrect) {
    // Correct transition - show feedback and apply
    button.className = 'transition-button correct';
    
    setTimeout(() => {
      executeEasyModeTransition();
    }, 500);
    
  } else {
    // Incorrect transition - show feedback
    button.className = 'transition-button incorrect';
    
    swal({
      title: "Incorrect Transition",
      text: "That's not the correct transition. Try again!",
      icon: "error",
      button: {
        text: "Try Again",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
    
    // Reset button style after feedback
    setTimeout(() => {
      refreshEasyModeButtonStates();
    }, 500);
  }
}

/**
 * Check if the selected transition is correct
 */
function isCorrectTransition(fromState, symbol, toState, write, move) {
  const simulationState = getCurrentSimulationState();
  
  if (!simulationState.isValid || simulationState.isAtEnd) {
    return false;
  }
  
  // Get the current and next states from the trace
  const states = dtm[dtmIndex]["input"][inputIndex]["states"];
  if (stateIndex >= states.length - 1) {
    return false; // No next state available
  }
  
  const currentState = states[stateIndex];
  const nextState = states[stateIndex + 1];
  
  // Verify this is the right state and symbol
  const currentStateId = currentState[2];
  const currentSymbol = currentState[0][currentState[1]];
  
  if (fromState !== currentStateId || symbol !== currentSymbol) {
    return false;
  }
  
  // Check if the transition matches the expected next state
  const expectedToState = nextState[2];
  const expectedWrite = nextState[0][currentState[1]];
  
  let expectedMove = "S";
  if (currentState[1] < nextState[1]) {
    expectedMove = "R";
  } else if (currentState[1] > nextState[1]) {
    expectedMove = "L";
  }
  
  return (toState === expectedToState && 
          write === expectedWrite && 
          move === expectedMove);
}

/**
 * Execute the transition in easy mode
 */
function executeEasyModeTransition() {
  const simulationState = getCurrentSimulationState();
  
  if (!simulationState.isValid || simulationState.isAtEnd) {
    return;
  }
  
  // Advance the simulation
  stateIndex++;
  inputPointer = stateIndex;
  
  // Update the visual display
  refreshInput();
  refreshCanvas();
  
  // Add step to the trace
  const states = dtm[dtmIndex]["input"][inputIndex]["states"];
  const prevState = states[stateIndex - 1];
  const currState = states[stateIndex];
  
  let str = `State: ${prevState[2]} → ${currState[2]}, `;
  str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
  
  if (prevState[1] > currState[1]) {
    str += "Move Left";
  } else if (prevState[1] < currState[1]) {
    str += "Move Right";
  } else {
    str += "Stay";
  }
  
  addToStack(str, 'easy');
  
  // Check if simulation is complete
  if (stateIndex >= states.length - 1) {
    handleSimulationComplete();
  }
  
  // Refresh button states for the new simulation state
  refreshEasyModeButtonStates();
}

/**
 * Handle simulation completion
 */
function handleSimulationComplete() {
  const states = dtm[dtmIndex]["input"][inputIndex]["states"];
  const finalState = states[stateIndex];
  const finalCell = finalState[0][finalState[1]];
  
  if (finalCell === "S") {
    swal({
      title: "Congratulations!",
      text: "You successfully guided the DTM to accept the input string!",
      icon: "success",
      button: {
        text: "Continue",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
  } else {
    swal({
      title: "Simulation Complete",
      text: "You completed the simulation. The DTM has rejected the input string.",
      icon: "error",
      button: {
        text: "Continue",
        className: "swal-button--confirm"
      },
      className: "gradient-modal"
    });
  }
}

/**
 * Start Easy Mode Simulation
 */
function startEasyModeSimulation() {
  // Initialize simulation state
  stateIndex = 0;
  inputPointer = 0;
  
  // Update UI
  updateUIForCurrentState();
  updateEasyModeInterface();
  
  // Refresh button states
  refreshEasyModeButtonStates();
  
  // Add initial step to stack
  if (dtm && dtm[dtmIndex] && dtm[dtmIndex]["input"] && dtm[dtmIndex]["input"][inputIndex] && dtm[dtmIndex]["input"][inputIndex]["states"]) {
    const initialState = dtm[dtmIndex]["input"][inputIndex]["states"][0];
    addToStack(`Starting simulation in state ${initialState[2]}`, 'easy');
  }
}

/**
 * Public function to update button states (called from other modules)
 */
function updateEasyModeButtonStates() {
  refreshEasyModeButtonStates();
}
