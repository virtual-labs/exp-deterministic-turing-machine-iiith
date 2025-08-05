## Getting Started

1. **Open the Simulation**: Launch the Deterministic Turing Machine visualization in your web browser
2. **Choose Your Mode**: Select between **Easy Mode** (guided interaction) or **Hard Mode** (advanced control)
3. **Review the Interface**: The simulation displays a Quick Guide, mode tabs, DTM visualization, transition table, and step trace

## Understanding the Interface

### Mode Selection
- **Easy Mode**: Interactive learning with guided transitions through clickable buttons
- **Hard Mode**: Advanced mode with full manual control over the machine

### Main Controls
- **Change DTM**: Switch between different Turing machine configurations (e.g., balanced strings checker)
- **Change Input**: Select from predefined input strings to test the DTM
- **Previous Step**: Go back to the previous configuration in the execution trace
- **Next Step**: Advance to the next step in the computation

### Components
- **DTM Description**: Shows the current machine's purpose and description
- **Input String Display**: Visualizes the input tape with current head position highlighted in red
- **Turing Machine Visualization**: SVG representation of the tape, head position, and current state
- **Transition Table**: Interactive table showing all possible state transitions
- **Steps Panel**: Right-side trace showing the execution history with states and tape configurations

## Step-by-Step Procedure

### Step 1: Select DTM and Input
1. Use **Change DTM** to choose a Turing machine (e.g., "Check if input is balanced")
2. Use **Change Input** to select a test string
3. Review the DTM description and transition table

### Step 2: Easy Mode Operation
1. **Observe Current State**: The machine starts in initial state q0 with the tape head at position 0
2. **Interactive Transitions**: Click on highlighted transition buttons in the transition table
3. **Visual Feedback**: Watch the tape head move and symbols change on the tape
4. **Step Progression**: Each click applies one transition and updates the machine configuration

### Step 3: Hard Mode Operation
1. **Manual Control**: Use **Next Step** to advance through the computation automatically
2. **Detailed Analysis**: Examine each transition's effect on state, tape content, and head position
3. **Backtracking**: Use **Previous Step** to review previous configurations

### Step 4: Understanding Execution
- **Tape Changes**: Observe how symbols are read, written, and replaced on the tape
- **Head Movement**: Watch the tape head move left (L), right (R), or stay (S)
- **State Transitions**: Track state changes from q0 through intermediate states to final states
- **Trace History**: Review the complete execution in the Steps panel

### Step 5: Analyzing Results
- **Acceptance**: If the machine reaches a HALT state, observe the final tape configuration
- **Rejection**: If the machine gets stuck or enters a rejecting state, analyze why
- **Pattern Recognition**: Notice how the DTM processes different parts of the input string


## Understanding DTM Behavior

- **Deterministic Nature**: Each state-symbol combination has exactly one transition
- **Tape Operations**: Read current symbol, write new symbol, move head direction
- **State Management**: Track current state and follow transition rules precisely
- **Termination**: Machine halts when reaching final state or no valid transition exists
