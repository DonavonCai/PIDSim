/*
Shunting Yard algorithm for converting infix to postfix:
1.  While there are tokens to be read:
2.        Read a token
3.        If it's a number add it to queue
4.        If it's an operator
5.               While there's an operator on the top of the stack with greater precedence:
6.                       Pop operators from the stack onto the output queue
7.               Push the current operator onto the stack
8.        If it's a left bracket push it onto the stack
9.        If it's a right bracket
10.            While there's not a left bracket at the top of the stack:
11.                     Pop operators from the stack onto the output queue.
12.             Pop the left bracket from the stack and discard it
13. While there are operators on the stack, pop them to the queue
*/

// Type can be "op", "var", "num", "lparen", "rparen"
// Tokens should be used exclusively for the tokenize() function
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

// Helper functions:
function isOperator(c) {
    switch(c) {
        case "+":
            return true;
        case "-":
            return true;
        case "*":
            return true;
        case "/":
            return true;
        case "=":
            return true;
        default:
            return false;
    }
}

function isLetter(c) {
    return (/[a-z]/i).test(c);
}

function isDigit(c) {
    return /[0-9]|\./.test(c);
}

function isParen(c) {
    return (c == "(" || c == ")");
}

function precedence(c) {
    switch(c) {
        case "=":
            return 0;
        case "+":
        case "-":
            return 1;
        case "*":
        case "/":
            return 2;
    }
}

// Custom Controller:
var customController = {
    stack: new Stack(),
    queue: [],
    trees: [],
    variables: [new Variable("Actuator", 0), new Variable("Desired", 0), new Variable("Actual", 0)],
    initialized: false,

    varIndexOf: function(name) {
        for (var i = 0; i < this.variables.length; i++) {
            if (this.variables[i].name == name) {
                return i;
            }
        }
        return -1;
    },

    tokenize: function(str) {
        var j, curChar;
        var type = "";
        var value = "";
        var stackOp, thisOp;

        // Iterate through the word
        for (j = 0; j < str.length; j++) {
            curChar = str.charAt(j);

            if (curChar == " ") {
                continue;
            }
            else if (isDigit(curChar)) {
                // If previous token is a var, push the var and *
                if (type == "var") {
                    this.queue.push(new Token(type, value));
                    this.stack.push(new Token("op", "*"));
                    // and start parsing the digit
                    value = "";
                }

                // Or if the previous token is a ), only push the *
                else if (type == "rparen") {
                    this.stack.push(new Token("op", "*"));
                    value = "";
                }

                type = "num";
                value = value.concat(curChar);

                // If the char is at the end of the word, the number is complete
                if (j == str.length - 1) {
                    this.queue.push(new Token(type, value));
                }
            }
            else if (isLetter(curChar)) {
                if (type == "num") {
                    this.queue.push(new Token(type, value));
                    this.stack.push(new Token("op", "*"));
                    value = "";
                }
                else if (type == "rparen") {
                    this.stack.push(new Token("op", "*"));
                    value = "";
                }

                type = "var";
                value = value.concat(curChar);

                if (j == str.length - 1) {
                    this.queue.push(new Token(type, value));
                }
            }
            else if (isOperator(curChar)) {
                // push the left operand (must not be an var or num) to queue
                if (type != "op" && type != "lparen" && type != "rparen" && type != "") {
                    this.queue.push(new Token(type, value));
                }

                type = "op";
                value = curChar;
                thisOp = new Token(type, value);
                stackOp = this.stack.peek();
                while(stackOp != null && precedence(stackOp.value) > precedence(thisOp.value)) {
                    this.queue.push(this.stack.pop());
                    stackOp = this.stack.peek();
                }

                // Then push whatever operator this is
                this.stack.push(new Token(type, value));
                value = "";
            }
            else if (isParen(curChar)) {
                if (type != "op" && type != "") {
                    this.queue.push(new Token(type, value));
                    if (curChar == "(") {
                        this.stack.push(new Token("op", "*"));
                    }
                }
                value = curChar;
                // if left paren, push onto stack
                if (value == "(") {
                    type = "lparen";
                    this.stack.push(new Token(type, value));
                }
                else {
                    type = "rparen";
                    stackOp = this.stack.peek();
                    while (stackOp != null && stackOp.value != "(") {
                        this.queue.push(this.stack.pop());
                        stackOp = this.stack.peek();
                    }
                    this.stack.pop();
                }
                value = "";
            }
            else {
                console.error("Invalid character");
            }
        }

        // Push any remaining stack into queue
        while(!this.stack.isEmpty()) {
            this.queue.push(this.stack.pop());
        }
    },

    setModel(str) {
        str = str.split("\n");
        for (var i = 0; i < str.length; i++) {
            if (str[i]) {
                this.trees.push(new ParseTree());
                this.tokenize(str[i]);
                this.trees[i].createTree(this.queue);
                this.queue = [];
            }
        }
    },

    onlyUnique: function (value, index, self) {
        return self.indexOf(value) === index;
    },

    readSystemVars() {
        var idx;
        idx = this.varIndexOf("Desired");
        this.variables[idx].value = parseFloat($("#desired").val());

        idx = this.varIndexOf("Actual");
        this.variables[idx].value = pid.Actual;
    },

    initUserVars() {
        // Initialize vars entered by user
        if (!this.initialized) {
            var varList = [];
            var curVar;
            // First, get list of variables
            for (var i = 0; i < this.trees.length; i++) {
                varList.push.apply(varList, this.trees[i].getVariables(this.trees[i].root));
                // and remove duplicates
                varList = varList.filter(this.onlyUnique);
            }
            // Then itialize all variables to 0
            for (var i = 0; i < varList.length; i++) {
                curVar = new Variable(varList[i], 0);
                this.variables.push(curVar);
            }
            this.initialized = true;
        }
    },

    updateController() {
        this.readSystemVars();
        this.initUserVars();

        var name;
        for (var i = 0; i < this.trees.length; i++) {
            // Find the variable we are assigning
            name = this.trees[i].rootLHS();
            if (name == null) {
                console.error("No left operand on =");
                return;
            }
            else if (isOperator(name)) {
                console.error("Operator is left of =");
                return;
            }

            // Now pass variables to parse tree, execute, and store the result
            this.variables[this.varIndexOf(name)].value = this.trees[i].executeRoot(this.variables);
            console.log(name,"is",this.variables[this.varIndexOf(name)].value);

            // set actuator
            var actuatorIdx = this.varIndexOf("Actuator");
            pid.Actuator = this.variables[actuatorIdx].value;

            if(pid.Actuator < ACTUATOR_MIN)
                pid.Actuator = ACTUATOR_MIN;
            if(pid.Actuator > ACTUATOR_MAX)
                pid.Actuator = ACTUATOR_MAX;

            $("#actuatorValue").text("Actuator: "+pid.Actuator.toFixed(6));
            pidAnim.adjustFan(pid.Actuator, maxSpeed);
        }
    },

    reset() {
        this.stack = new Stack();
        this.queue = [];
        this.trees = [];
        this.variables = [new Variable("Actuator", 0), new Variable("Desired", 0), new Variable("Actual", 0)];
        this.initialized = false;
    }
}

// Button functions:
function hideCustomPopup() {
    $("#customEquationPopup").hide();
}

function showCustomPopup() {
    $("#customEquationPopup").show();
}

function hideCustom() {
    $("#openCustom").hide();
    $("#customEquationPopup").hide();
}

function showCustom() {
    $("#openCustom").show();
    $("#customEquationPopup").show();
}