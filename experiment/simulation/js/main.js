/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

dtm = [dtm1, dtm2];
dtmIndex = 0;

stateIndex = 0;
inputIndex = 0;
inputPointer = -1;

function refreshCanvas() {
  clearElem(canvas);
  clearElem(canvas2);

  let curr = "";
  if (inputPointer !== -1) {
    curr = dtm[dtmIndex]["input"][inputIndex]["states"][inputPointer];
  }

  const DTMDescriptionContainer = document.getElementById(
    "DTM_description_container"
  );
  clearElem(DTMDescriptionContainer);

  const span = newElement("span", [
    ["id", "DFA_description"],
    ["style", "color: brown; font-size: 2 rem;"],
  ]);
  const text = document.createTextNode(dtm[dtmIndex]["description"]);
  span.appendChild(text);
  DTMDescriptionContainer.appendChild(span);

  displayCanvas(canvas, canvas2, dtm[dtmIndex], inputIndex, stateIndex);
}

function resetInput() {
  inputIndex = 0;
  stateIndex = 0;
  inputPointer = -1;

  refreshInput();
}

function refreshInput() {
  const inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);

  // Get the current input string
  const inputString = dtm[dtmIndex]["input"][inputIndex]["string"];

  // Iterate over the string and dynamically style each character
  for (let i = 0; i < inputString.length; i++) {
    // Set the color to red if the inputPointer is at the current position, otherwise black
    const textColor = inputPointer === i ? "red" : "black";

    // Create a span element for the character
    const span = newElement("span", [
      ["id", "text_" + i],
      ["style", `color: ${textColor}; font-size: 2.5rem;`], // Restored original font size
    ]);

    // Add the character to the span
    const text = document.createTextNode(inputString[i]);
    span.appendChild(text);

    // Append the span to the input container
    inputContainer.appendChild(span);
  }
}

function resetStack() {
  const stack = document.getElementById("stack_list");
  clearElem(stack);
}

function addToStack(str) {
  const stack = document.getElementById("stack_list");
  const listElem = newElement("li", []);
  const textNode = document.createTextNode(str);
  listElem.appendChild(textNode);
  if (stack.firstChild) {
    stack.firstChild.style.fontWeight = "normal";
    stack.insertBefore(listElem, stack.firstChild);
  } else {
    stack.appendChild(listElem);
  }
  stack.firstChild.style.fontWeight = "bold";
}

function removeFromStack() {
  const stack = document.getElementById("stack_list");
  if (stack.firstChild) {
    stack.removeChild(stack.firstChild);

    if (stack.firstChild) {
      stack.firstChild.style.fontWeight = "bold";
    }
  }
}

function updateTransitions() {
  const transitionTable = document.getElementById("transition_table_container");
  clearElem(transitionTable);

  const table = newElement("table", [["id", "transition_table"]]);

  const tr0 = newElement("tr", [["id", "tr0"]]);

  const tr0th0 = newElement("th", [["id", "tr0_th0"]]);
  tr0th0.appendChild(document.createTextNode("State"));
  tr0.appendChild(tr0th0);
  table.appendChild(tr0);

  Object.keys(dtm[dtmIndex]["transition"]["q0"]).forEach(function (
    keyName,
    keyIndex
  ) {
    const th = newElement("th", [["id", "tr0_th" + (keyIndex + 1)]]);
    th.appendChild(document.createTextNode(keyName));
    tr0.appendChild(th);
  });

  Object.keys(dtm[dtmIndex]["transition"]).forEach(function (
    stateName,
    stateIndex
  ) {
    const tr = newElement("tr", [["id", "tr" + (stateIndex + 1)]]);

    const trtd0 = newElement("td", [["id", "tr" + (stateIndex + 1) + "_td0"]]);
    trtd0.appendChild(document.createTextNode(stateName));
    tr.appendChild(trtd0);

    Object.keys(dtm[dtmIndex]["transition"][stateName]).forEach(function (
      keyName,
      keyIndex
    ) {
      const trtd = newElement("td", [
        ["id", "tr" + (stateIndex + 1) + "_td" + (keyIndex + 1)],
      ]);
      trtd.appendChild(
        document.createTextNode(dtm[dtmIndex]["transition"][stateName][keyName])
      );
      tr.appendChild(trtd);
    });
    table.appendChild(tr);
  });

  transitionTable.appendChild(table);
}

window.addEventListener("load", function (e) {
  canvas = document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2");

  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();

  // Event listener for changing DFA
  changeDTM = document.getElementById("change_dtm");
  changeDTM.addEventListener("click", function (e) {
    clearElem(canvas);
    dtmIndex = dtmIndex + 1;
    if (dtmIndex >= dtm.length) {
      dtmIndex = 0;
    }
    resetInput();
    refreshCanvas();
    resetStack();
    updateTransitions();
  });

  // Event listener for changing input
  changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function (e) {
    inputIndex = inputIndex + 1;
    if (inputIndex >= dtm[dtmIndex]["input"].length) {
      inputIndex = 0;
    }
    stateIndex = 0;
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
    resetStack();
  });

  // Event listener for next
  next = document.getElementById("next");
  next.addEventListener("click", function (e) {
    if (stateIndex < dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
      stateIndex++;
      inputPointer = stateIndex; // Update the inputPointer to track the current position
      refreshInput();
      refreshCanvas();

      const prevState =
        dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex - 1];
      const currState =
        dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
      let str = `Read: ${prevState[0][prevState[1]]}, Write: ${currState[0][prevState[1]]}`;
      if (prevState[1] > currState[1]) {
        str += ", Move Left";
      } else {
        str += ", Move Right";
      }
      str += `, New State: ${currState[2]}`;
      addToStack(str);

      const currCell =
        dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][0][
        dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][1]
        ];
      if (stateIndex === dtm[dtmIndex]["input"][inputIndex]["states"].length - 1) {
        if (currCell === "S") {
          swal("Input string was accepted");
        } else {
          swal("Input string was rejected");
        }
      }
    }
  });

  // Event listener for prev
  prev = document.getElementById("prev");
  prev.addEventListener("click", function (e) {
    if (stateIndex > 0) {
      stateIndex--;
      inputPointer = stateIndex; // Update the inputPointer to track the current position
      refreshInput();
      refreshCanvas();
      removeFromStack();
    }
  });
});
