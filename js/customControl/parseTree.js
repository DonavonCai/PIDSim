class Node {
    constructor(token, leftChild, rightChild) {
        this.type = token.type;
        this.value = token.value;
        this.left = leftChild;
        this.right = rightChild;
    }
}

class ParseTree {
    constructor() {
        this.root = null;
        this.stack = new Stack();
        this.variables = [];
    }
    createTree(queue) {
        var node;
        var leftChild, rightChild;
        for (var i = 0; i < queue.length; i++) {
            // If number or var, turn into leaf node and push onto stack
            if (queue[i].type == "num" || queue[i].type == "var") {
                node = new Node(queue[i], null, null);
                this.stack.push(node);
            }
            // If op,
            else if (queue[i].type == "op") {
                rightChild = this.stack.pop();
                leftChild = this.stack.pop();
                node = new Node(queue[i], leftChild, rightChild);
                this.stack.push(node);
                this.root = node;
            }
        }
    }
    getVariables(node) {
        var vars = [];
        // todo: inorder traversal, return array
        if (node.left != null) {
            vars.push.apply(vars, this.getVariables(node.left));
        }
        if (node.type == "var") {
            vars.push(node.value);
        }

        if (node.right != null) {
            vars.push.apply(vars, this.getVariables(node.right));
        }
        return vars;
    }
    rootLHS() {
        if (this.root.left != null)
            return this.root.left.value;
        else
            return null;
    }
    varIndex(name) {
        for (var i = 0; i < this.variables.length; i++) {
            if (name == this.variables[i].name)
                return i;
        }
        return -1;
    }
    // Preorder traversal, computing value of a node
    executeNode(node) {
        var result = 0;
        if (node.type == "num") {
            result = parseFloat(node.value);
        }
        else if (node.type == "var") {
            // perform variable lookup
            var varName = node.value;
            var idx = this.varIndex(varName);
            result = this.variables[idx].value;
        }
        else if (node.type == "op") {
            if (node.left == null || node.right == null) {
                console.error("Node does not have 2 operands");
            }

            var lhs = this.executeNode(node.left);
            var rhs = this.executeNode(node.right);
            switch(node.value) {
                case "+":
                    result = lhs + rhs;
                    break;
                case "-":
                    result = lhs - rhs;
                    break;
                case "*":
                    result = lhs * rhs;
                    break;
                case "/":
                    result = lhs / rhs;
                    break;
                case "=":
                    console.error("more than 1 = operator in instruction")
                default:
                    console.error("unrecognized operator",node.value);
            }
        }
        return result;
    }
    // takes in name of variable (should be left of root), and executes tree
    executeRoot(variables) {
        // copy the table of variables
        this.variables = variables;

        if (this.root.right != null) {
            var result = this.executeNode(this.root.right);
        }
        else {
            console.error("no rhs in parse tree");
        }
        return result;
    }
}