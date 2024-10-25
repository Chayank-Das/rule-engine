// backend/services/ast.js

const jsep = require('jsep');

// Adjust operator precedences
jsep.addBinaryOp('AND', 2);
jsep.addBinaryOp('OR', 1);
jsep.addBinaryOp('=', 6);

// Attribute Catalog
const attributeCatalog = ['age', 'department', 'salary', 'experience'];

// Create an AST from a rule string
function createAST(ruleString) {
    try {
        const expression = jsep(ruleString);
        return convertToCustomAST(expression);
    } catch (error) {
        throw new Error(`Invalid rule string: ${error.message}`);
    }
}

// Convert jsep's AST to our custom AST format
function convertToCustomAST(node) {
    if (node.type === 'BinaryExpression') {
        const operator = node.operator === '=' ? '==' : node.operator;
        const nodeType = ['AND', 'OR'].includes(operator.toUpperCase()) ? 'logical' : 'comparison';
        return {
            type: nodeType,
            operator: operator.toUpperCase(),
            left: convertToCustomAST(node.left),
            right: convertToCustomAST(node.right)
        };
    } else if (node.type === 'Literal') {
        return { type: 'operand', value: node.value };
    } else if (node.type === 'Identifier') {
        if (!attributeCatalog.includes(node.name)) {
            throw new Error(`Invalid attribute: '${node.name}' is not in the catalog`);
        }
        return { type: 'operand', value: node.name };
    } else {
        throw new Error(`Unsupported node type: ${node.type}`);
    }
}

// Combine multiple ASTs into one using a logical operator
function combineASTs(asts, operator = 'AND') {
    if (asts.length === 0) return null;
    return asts.reduce((combined, current) => {
        if (!combined) return current;
        return {
            type: 'logical',
            operator: operator.toUpperCase(),
            left: combined,
            right: current
        };
    }, null);
}

// Modify operator in AST
function modifyOperator(ast, path, newOperator) {
    const node = getNodeByPath(ast, path);
    if (node && node.operator) {
        node.operator = newOperator.toUpperCase();
    } else {
        throw new Error('Operator not found at the specified path');
    }
}

// Modify operand value in AST
function modifyOperandValue(ast, path, newValue) {
    const node = getNodeByPath(ast, path);
    if (node && node.type === 'operand') {
        node.value = newValue;
    } else {
        throw new Error('Operand not found at the specified path');
    }
}

// Add sub-expression to AST
function addSubExpression(ast, path, newExpressionAST, operator = 'AND') {
    const node = getNodeByPath(ast, path);
    if (node) {
        const combined = {
            type: 'logical',
            operator: operator.toUpperCase(),
            left: node,
            right: newExpressionAST
        };
        // Replace the node at the path with the combined node
        setNodeByPath(ast, path, combined);
    } else {
        throw new Error('Node not found at the specified path');
    }
}

// Remove sub-expression from AST
function removeSubExpression(ast, path) {
    const parentPath = path.slice(0, -1);
    const parentNode = getNodeByPath(ast, parentPath);
    const key = path[path.length - 1];

    if (parentNode && parentNode[key]) {
        // Replace the parent node with the sibling node
        const siblingKey = key === 'left' ? 'right' : 'left';
        const siblingNode = parentNode[siblingKey];
        setNodeByPath(ast, parentPath, siblingNode);
    } else {
        throw new Error('Sub-expression not found at the specified path');
    }
}

// Helper function to get a node by path
function getNodeByPath(ast, path) {
    return path.reduce((node, key) => (node ? node[key] : null), ast);
}

// Helper function to set a node by path
function setNodeByPath(ast, path, newNode) {
    let node = ast;
    for (let i = 0; i < path.length - 1; i++) {
        node = node[path[i]];
        if (!node) {
            throw new Error('Invalid path');
        }
    }
    node[path[path.length - 1]] = newNode;
}

// Extract value from userData or recursively evaluate nested nodes
function extractValue(node, userData) {
    if (node.type === 'operand') {
        const value = userData[node.value] !== undefined ? userData[node.value] : node.value;
        return value;
    } else {
        return evaluateAST(node, userData);
    }
}

// Evaluate a user object against an AST
function evaluateAST(ast, userData) {
    if (!ast) {
        return false;
    }

    const { type, operator, left, right } = ast;

    if (type === 'logical') {
        const leftResult = evaluateAST(left, userData);
        const rightResult = evaluateAST(right, userData);

        if (operator === 'AND') {
            return leftResult && rightResult;
        } else if (operator === 'OR') {
            return leftResult || rightResult;
        } else {
            throw new Error(`Unsupported logical operator: ${operator}`);
        }
    } else if (type === 'comparison') {
        const leftValue = extractValue(left, userData);
        const rightValue = extractValue(right, userData);

        // Perform comparisons
        switch (operator) {
            case '>':
                return leftValue > rightValue;
            case '>=':
                return leftValue >= rightValue;
            case '<':
                return leftValue < rightValue;
            case '<=':
                return leftValue <= rightValue;
            case '==':
                return leftValue == rightValue;
            default:
                throw new Error(`Unsupported comparison operator: ${operator}`);
        }
    } else if (type === 'operand') {
        return ast.value;
    } else {
        throw new Error(`Unsupported AST node type: ${type}`);
    }
}

module.exports = {
    createAST,
    combineASTs,
    modifyOperator,
    modifyOperandValue,
    addSubExpression,
    removeSubExpression,
    evaluateAST
};
