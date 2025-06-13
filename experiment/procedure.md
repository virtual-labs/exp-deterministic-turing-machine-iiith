### Operations on a Turing machine

- It starts in the initial state $q_0$ with the tape head positioned at the leftmost cell of the input.
- It reads the symbol from the current tape cell.
- Based on the current state and the symbol read, it uses the transition function δ to determine the next state, the symbol to write on the tape, and the direction in which to move the tape head.
- This process continues iteratively until the machine enters an accepting or rejecting state. If it enters an accepting state, the input is accepted; if it enters a rejecting state or gets stuck in an infinite loop, the input is rejected.
