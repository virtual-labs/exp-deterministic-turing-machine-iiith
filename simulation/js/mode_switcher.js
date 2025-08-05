/**
 * Mode Switcher - Handles switching between Easy and Hard modes
 */

// Global mode state
let currentMode = 'easy'; // Start with easy mode

/**
 * Initialize mode switcher
 */
function initializeModeSwitch() {
  const easyTab = document.getElementById('easy_mode_tab');
  const hardTab = document.getElementById('hard_mode_tab');
  
  if (!easyTab || !hardTab) {
    console.error('Mode tabs not found');
    return;
  }
  
  // Add event listeners
  easyTab.addEventListener('click', () => {
    switchToMode('easy');
  });
  hardTab.addEventListener('click', () => {
    switchToMode('hard');
  });
  
  // Immediately hide any existing interactive controls
  hideInteractiveControlsImmediately();
  
  // Initialize with easy mode - but wait for DTM data to be loaded
  waitForDTMData(() => {
    switchToMode('easy');
    // Ensure interactive controls stay hidden
    hideInteractiveControlsImmediately();
  });
}

/**
 * Immediately hide interactive controls if they exist
 */
function hideInteractiveControlsImmediately() {
  const interactiveControls = document.getElementById('interactive_controls');
  if (interactiveControls) {
    interactiveControls.style.display = 'none';
  }
  
  // Also check for any other manual control elements that might appear
  const currentStateInfo = document.getElementById('current_state_info');
  if (currentStateInfo) {
    currentStateInfo.style.display = 'none';
  }
}

/**
 * Wait for DTM data to be available
 */
function waitForDTMData(callback) {
  if (typeof dtm !== 'undefined' && dtm && dtm[0] && dtm[0]["transition"]) {
    callback();
  } else {
    setTimeout(() => waitForDTMData(callback), 100);
  }
}

/**
 * Switch to specified mode
 */
function switchToMode(mode) {
  if (currentMode === mode) return;
  
  currentMode = mode;
  
  // Update tab appearances
  updateTabAppearance();
  
  // Update interface based on mode
  if (mode === 'easy') {
    switchToEasyMode();
  } else {
    switchToHardMode();
  }
  
  console.log(`Switched to ${mode} mode`);
}

/**
 * Update tab button appearances
 */
function updateTabAppearance() {
  const easyTab = document.getElementById('easy_mode_tab');
  const hardTab = document.getElementById('hard_mode_tab');
  
  if (currentMode === 'easy') {
    easyTab.classList.add('active');
    hardTab.classList.remove('active');
  } else {
    hardTab.classList.add('active');
    easyTab.classList.remove('active');
  }
}

/**
 * Switch to Easy Mode
 */
function switchToEasyMode() {
  // Aggressively hide all hard mode interactive controls
  hideAllManualControls();
  
  // Update instruction text for easy mode
  updateTransitionTableInstruction('easy');
  
  // Show easy mode interface
  if (typeof showEasyModeInterface === 'function') {
    showEasyModeInterface();
  }
  
  // Update the transition table to be interactive - ensure it's recreated fresh
  if (typeof updateTransitionTableForEasyMode === 'function') {
    // Ensure DTM data is loaded before creating the table
    waitForDTMData(() => {
      // Force recreation of the table by calling updateTransitionTableForEasyMode
      updateTransitionTableForEasyMode();
      
      // Also update the interface state after table creation
      setTimeout(() => {
        if (typeof updateEasyModeInterface === 'function') {
          updateEasyModeInterface();
        }
      }, 100);
    });
  } else {
    console.error('updateTransitionTableForEasyMode function not available');
  }
  
  // Set up periodic check to ensure manual controls stay hidden
  if (currentMode === 'easy') {
    setTimeout(() => {
      if (currentMode === 'easy') {
        hideAllManualControls();
      }
    }, 500);
  }
}

/**
 * Hide all manual controls and related elements
 */
function hideAllManualControls() {
  // Only hide interactive controls container, don't remove individual elements
  const interactiveControls = document.getElementById('interactive_controls');
  if (interactiveControls) {
    interactiveControls.style.display = 'none';
  }
  
  // Hide current state info if it exists separately
  const currentStateInfo = document.getElementById('current_state_info');
  if (currentStateInfo) {
    currentStateInfo.style.display = 'none';
  }
}

/**
 * Switch to Hard Mode
 */
function switchToHardMode() {
  // Update instruction text for hard mode
  updateTransitionTableInstruction('hard');
  
  // Hide easy mode interface
  if (typeof hideEasyModeInterface === 'function') {
    hideEasyModeInterface();
  }
  
  // Ensure interactive controls exist and are visible
  ensureInteractiveControlsExist();
  
  // Update the transition table to be non-interactive
  updateTransitions();
  
  // Update interactive choices if in the middle of simulation
  if (inputPointer !== -1 && typeof updateInteractiveChoices === 'function') {
    updateInteractiveChoices();
  }
}

/**
 * Ensure interactive controls exist and are properly shown in Hard Mode
 */
function ensureInteractiveControlsExist() {
  let interactiveControls = document.getElementById('interactive_controls');
  
  if (!interactiveControls) {
    // Controls don't exist, create them
    if (typeof createInteractiveControls === 'function') {
      createInteractiveControls();
      interactiveControls = document.getElementById('interactive_controls');
    }
  }
  
  if (interactiveControls) {
    // Make sure controls are visible
    interactiveControls.style.display = 'block';
    
    // Ensure all child elements are also visible
    const selects = interactiveControls.querySelectorAll('select');
    const buttons = interactiveControls.querySelectorAll('button');
    const labels = interactiveControls.querySelectorAll('label');
    const divs = interactiveControls.querySelectorAll('div');
    
    [...selects, ...buttons, ...labels, ...divs].forEach(el => {
      if (el.style.display === 'none') {
        el.style.display = '';
      }
    });
    
    // Force initialization if needed
    if (typeof forceInitializeInteractiveControls === 'function') {
      setTimeout(() => {
        forceInitializeInteractiveControls();
      }, 100);
    }
  }
}

/**
 * Get current mode
 */
function getCurrentMode() {
  return currentMode;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Immediately hide any manual controls that might appear
  hideInteractiveControlsImmediately();
  
  // Wait a bit to ensure all other scripts are loaded
  setTimeout(initializeModeSwitch, 100);
  
  // Set up additional checks to ensure Easy Mode stays active
  setTimeout(() => {
    if (currentMode === 'easy') {
      hideAllManualControls();
    }
  }, 500);
  
  setTimeout(() => {
    if (currentMode === 'easy') {
      hideAllManualControls();
    }
  }, 1000);
});

// Also initialize when window loads as backup
window.addEventListener('load', function() {
  hideInteractiveControlsImmediately();
  
  const easyTab = document.getElementById('easy_mode_tab');
  const hardTab = document.getElementById('hard_mode_tab');
  
  if (easyTab && hardTab && !easyTab.classList.contains('active') && !hardTab.classList.contains('active')) {
    setTimeout(initializeModeSwitch, 100);
  }
  
  // Ensure Easy Mode stays active after page load
  setTimeout(() => {
    if (currentMode === 'easy') {
      hideAllManualControls();
      switchToMode('easy');
    }
  }, 1500);
});

/**
 * Update the transition table instruction text based on current mode
 */
function updateTransitionTableInstruction(mode) {
  const easyModeInstruction = document.querySelector('.easy-mode-only');
  
  if (mode === 'easy') {
    // Show Easy Mode instruction in transition table header
    if (easyModeInstruction) {
      easyModeInstruction.style.display = 'block';
    }
  } else {
    // Hide Easy Mode instruction (Hard Mode instruction is in the interactive controls)
    if (easyModeInstruction) {
      easyModeInstruction.style.display = 'none';
    }
  }
}
