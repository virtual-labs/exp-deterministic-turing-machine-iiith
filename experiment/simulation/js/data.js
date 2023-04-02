/****
  * File containing DTM descriptions
  *
  */

// DTM to accept strings of the form 0^n1^n
const dtm1 = {
  "description": "Check if input is balanced.",
  "transition": {
    "q0": {"0": ["(q1,X,R)"], "1": [], "X": [], "Y": ["(q3,Y,R)"], "S": []},
    "q1": {"0": ["(q1,0,R)"], "1": ["(q2,Y,L)"], "X": [], "Y": ["(q1,Y,R)"], "S": []},
    "q2": {"0": ["(q2,0,L)"], "1": [], "X": ["(q0,X,R)"], "Y": ["(q2,Y,L)"], "S": []},
    "q3": {"0": [], "1": [], "X": [], "Y": ["(q3,Y,R)"], "S": ["HALT"]}
  },
  "input": [
    {
      "string": "000111S",
      "states": [
        ["000111S", 0, "q0"],
        ["X00111S", 1, "q1"],
        ["X00111S", 2, "q1"],
        ["X00111S", 3, "q1"],
        ["X00Y11S", 2, "q2"],
        ["X00Y11S", 1, "q2"],
        ["X00Y11S", 0, "q2"],
        ["X00Y11S", 1, "q0"],
        ["XX0Y11S", 2, "q1"],
        ["XX0Y11S", 3, "q1"],
        ["XX0Y11S", 4, "q1"],
        ["XX0YY1S", 3, "q2"],
        ["XX0YY1S", 2, "q2"],
        ["XX0YY1S", 1, "q2"],
        ["XX0YY1S", 2, "q0"],
        ["XXXYY1S", 3, "q1"],
        ["XXXYY1S", 4, "q1"],
        ["XXXYY1S", 5, "q1"],
        ["XXXYYYS", 4, "q2"],
        ["XXXYYYS", 3, "q2"],
        ["XXXYYYS", 2, "q2"],
        ["XXXYYYS", 3, "q0"],
        ["XXXYYYS", 4, "q3"],
        ["XXXYYYS", 5, "q3"],
        ["XXXYYYS", 6, "q3"]
      ]
    },
    {
      "string": "0011S",
      "states": [
        ["0011S", 0, "q0"],
        ["X011S", 1, "q1"],
        ["0011S", 2, "q1"],
        ["X0Y1S", 1, "q2"],
        ["X0Y1S", 0, "q2"],
        ["X0Y1S", 1, "q0"],
        ["XXY1S", 2, "q1"],
        ["XXY1S", 3, "q1"],
        ["XXYYS", 2, "q2"],
        ["XXYYS", 1, "q2"],
        ["XXYYS", 2, "q0"],
        ["XXYYS", 3, "q3"],
        ["XXYYS", 4, "q3"]
      ]
    }
  ]
}
