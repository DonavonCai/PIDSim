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

// Stack class shamelessly stolen from here: https://medium.com/better-programming/implementing-a-stack-in-javascript-73d1aa0483c1
class Stack {
    constructor(){
        this.data = [];
        this.top = 0;
    }
    push(element) {
      this.data[this.top] = element;
      this.top = this.top + 1;
    }
   length() {
      return this.top;
   }
   isEmpty() {
     return this.top === 0;
   }
   pop() {
    if( this.isEmpty() === false ) {
       this.top = this.top -1;
       return this.data.pop();
     }
   }
}

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

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
        case "(":
            return true;
        case ")":
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

var customController = {
    stack: new Stack(),

    printStack: function() {
        console.log("Printing stack:");
        var entry;
        while (!this.stack.isEmpty()) {
            entry = this.stack.pop();
            console.log("(", entry.type, ", ", entry.value, ")");
        }
    },

    tokenize: function(str) {
        var i, j, curStr, curChar;
        var type = "";
        var value = "";
        // TODO: split by \n, then loop through?

        str = str.split(" ");
        // str contains an array of words, each word might have an operator in it
        for (i = 0; i < str.length; i++) {
            curStr = str[i];
            // Iterate through the word
            for (j = 0; j < curStr.length; j++) {
                curChar = curStr.charAt(j);

                if (isDigit(curChar)) {
                    // If the previous token is a var, perform implicit multiplication
                    if (type == "var" || type == "") {
                        this.stack.push(new Token(type, value));
                        this.stack.push(new Token("op", "*"));
                        // and start creating a new token
                        value = "";
                    }

                    type = "num";
                    value = value.concat(curChar);

                    // If the char is at the end of the word, the number is complete
                    if (j == curStr.length - 1) {
                        this.stack.push(new Token(type, value));
                    }
                }
                else if (isLetter(curChar)) {
                    if (type == "num") {
                        this.stack.push(new Token(type, value));
                        this.stack.push(new Token("op", "*"));
                        value = "";
                    }

                    type = "var";
                    value = value.concat(curChar);

                    if (j == curStr.length - 1)
                        this.stack.push(new Token(type, value));
                }
                else if (isOperator(curChar)) {
                    // push the left operand (must be a num or var)
                    if (type != "op" && type != "") {
                        this.stack.push(new Token(type, value));
                    }
                    // Then push whatever operator this is
                    type = "op";
                    value = curChar;
                    this.stack.push(new Token(type, curChar));
                    value = "";
                }
                else {
                    console.log("Invalid character");
                }
            }
        }
    },
    createAST: function() {
        console.log("createAST");
    },
    parse(str) {
        // TODO: split by \n and parse lines?
        this.tokenize(str);
        this.printStack();
        this.createAST();
    }
}