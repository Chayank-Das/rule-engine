// frontend/script.js

const apiUrl = 'http://localhost:3000/api/rules';
const multiApiUrl = 'http://localhost:3000/api/multirules';

// Utility function to display error messages
function displayError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Single Rule Functions
async function addRule() {
    const name = document.getElementById('ruleName').value;
    const ruleString = document.getElementById('ruleInput').value;

    if (!name || !ruleString) {
        displayError('Please enter both rule name and rule string.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ruleString })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchRule() {
    const name = document.getElementById('modifyRuleName').value;

    try {
        const response = await fetch(`${apiUrl}/${name}`);
        const rule = await response.json();

        if (!response.ok) {
            throw new Error(rule.message);
        }

        document.getElementById('ruleStringDisplay').innerText = `Rule String: ${reconstructRuleString(rule.ast)}`;
        document.getElementById('modifyRuleDetails').style.display = 'block';

        // Store the current rule in a global variable for easy access
        window.currentRule = rule;

    } catch (error) {
        displayError(error.message);
    }
}

async function modifyOperator() {
    const name = document.getElementById('modifyRuleName').value;
    const pathInput = prompt('Enter the path to the operator (e.g., operator or left.operator)');
    const newOperator = prompt('Enter the new operator (AND, OR, >, >=, <, <=, ==)');

    if (!pathInput || !newOperator) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${apiUrl}/modifyOperator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, newOperator })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Operator modified successfully');

        // Update the local copy of the rule
        modifyOperatorInLocalRule(window.currentRule.ast, path, newOperator);

        // Update the rule string display
        document.getElementById('ruleStringDisplay').innerText = `Rule String: ${reconstructRuleString(window.currentRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function modifyOperand() {
    const name = document.getElementById('modifyRuleName').value;
    const pathInput = prompt('Enter the path to the operand (e.g., left.left)');
    const newValue = prompt('Enter the new operand value');

    if (!pathInput || newValue === null) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${apiUrl}/modifyOperand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, newValue })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Operand value modified successfully');

        // Update the local copy of the rule
        modifyOperandInLocalRule(window.currentRule.ast, path, newValue);

        // Update the rule string display
        document.getElementById('ruleStringDisplay').innerText = `Rule String: ${reconstructRuleString(window.currentRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function addSubExpression() {
    const name = document.getElementById('modifyRuleName').value;
    const pathInput = prompt('Enter the path where to add the sub-expression (e.g., right)');
    const newExpressionString = prompt('Enter the new sub-expression (e.g., salary > 50000)');
    const operator = prompt('Enter the operator to combine with (AND/OR)', 'AND');

    if (!pathInput || !newExpressionString || !operator) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${apiUrl}/addSubExpression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, newExpressionString, operator })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Sub-expression added successfully');

        // Update the local copy of the rule
        const newExpressionAST = createASTFromString(newExpressionString);
        addSubExpressionToLocalRule(window.currentRule.ast, path, newExpressionAST, operator);

        // Update the rule string display
        document.getElementById('ruleStringDisplay').innerText = `Rule String: ${reconstructRuleString(window.currentRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function removeSubExpression() {
    const name = document.getElementById('modifyRuleName').value;
    const pathInput = prompt('Enter the path to the sub-expression to remove (e.g., right)');

    if (!pathInput) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${apiUrl}/removeSubExpression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Sub-expression removed successfully');

        // Update the local copy of the rule
        removeSubExpressionFromLocalRule(window.currentRule.ast, path);

        // Update the rule string display
        document.getElementById('ruleStringDisplay').innerText = `Rule String: ${reconstructRuleString(window.currentRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function evaluateRuleByName() {
    const userDataText = document.getElementById('userData').value;
    const name = document.getElementById('evaluateRuleName').value;

    if (!name) {
        alert('Please enter the rule name to evaluate.');
        return;
    }

    let userData;
    try {
        userData = JSON.parse(userDataText);
    } catch (e) {
        displayError('Invalid JSON in user data.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/evaluateByName`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userData })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        document.getElementById('result').innerText =
            result.eligible ? 'User is eligible' : 'User is not eligible';
    } catch (error) {
        displayError(error.message);
    }
}

// Combined Rule Functions
async function addCombinedRule() {
    const name = document.getElementById('combinedRuleName').value;
    const ruleStringsText = document.getElementById('combinedRuleStrings').value;
    const operator = document.getElementById('combinedOperator').value;

    if (!name || !ruleStringsText) {
        displayError('Please enter both combined rule name and rule strings.');
        return;
    }

    const ruleStrings = ruleStringsText.split('\n').map(str => str.trim()).filter(str => str);

    try {
        const response = await fetch(`${multiApiUrl}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ruleStrings, operator })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);
        // Clear the input fields
        document.getElementById('combinedRuleName').value = '';
        document.getElementById('combinedRuleStrings').value = '';
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchCombinedRule() {
    const name = document.getElementById('modifyCombinedRuleName').value;

    try {
        const response = await fetch(`${multiApiUrl}/${name}`);
        const combinedRule = await response.json();

        if (!response.ok) {
            throw new Error(combinedRule.message);
        }

        // Display the reconstructed rule string
        document.getElementById('combinedRuleStringDisplay').innerText = `Combined Rule String: ${reconstructRuleString(combinedRule.ast)}`;
        document.getElementById('modifyCombinedRuleDetails').style.display = 'block';

        // Store the current combined rule in a global variable
        window.currentCombinedRule = combinedRule;

    } catch (error) {
        displayError(error.message);
    }
}

async function modifyCombinedOperator() {
    const name = document.getElementById('modifyCombinedRuleName').value;
    const pathInput = prompt('Enter the path to the operator (e.g., operator or left.operator)');
    const newOperator = prompt('Enter the new operator (AND, OR, >, >=, <, <=, ==)');

    if (!pathInput || !newOperator) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${multiApiUrl}/modifyOperator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, newOperator })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Operator modified successfully');

        // Update the local copy of the combined rule
        modifyOperatorInLocalRule(window.currentCombinedRule.ast, path, newOperator);

        // Update the rule string display
        document.getElementById('combinedRuleStringDisplay').innerText = `Combined Rule String: ${reconstructRuleString(window.currentCombinedRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function modifyCombinedOperand() {
    const name = document.getElementById('modifyCombinedRuleName').value;
    const pathInput = prompt('Enter the path to the operand (e.g., left.left)');
    const newValue = prompt('Enter the new operand value');

    if (!pathInput || newValue === null) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${multiApiUrl}/modifyOperand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, newValue })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Operand value modified successfully');

        // Update the local copy of the combined rule
        modifyOperandInLocalRule(window.currentCombinedRule.ast, path, newValue);

        // Update the rule string display
        document.getElementById('combinedRuleStringDisplay').innerText = `Combined Rule String: ${reconstructRuleString(window.currentCombinedRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function addCombinedSubExpression() {
    const name = document.getElementById('modifyCombinedRuleName').value;
    const pathInput = prompt('Enter the path where to add the sub-expression (e.g., right)');
    const newExpressionString = prompt('Enter the new sub-expression (e.g., salary > 50000)');
    const operator = prompt('Enter the operator to combine with (AND/OR)', 'AND');

    if (!pathInput || !newExpressionString || !operator) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${multiApiUrl}/addSubExpression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path, newExpressionString, operator })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Sub-expression added successfully');

        // Update the local copy of the combined rule
        const newExpressionAST = createASTFromString(newExpressionString);
        addSubExpressionToLocalRule(window.currentCombinedRule.ast, path, newExpressionAST, operator);

        // Update the rule string display
        document.getElementById('combinedRuleStringDisplay').innerText = `Combined Rule String: ${reconstructRuleString(window.currentCombinedRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function removeCombinedSubExpression() {
    const name = document.getElementById('modifyCombinedRuleName').value;
    const pathInput = prompt('Enter the path to the sub-expression to remove (e.g., right)');

    if (!pathInput) {
        alert('Operation cancelled.');
        return;
    }

    const path = pathInput.split('.');

    try {
        const response = await fetch(`${multiApiUrl}/removeSubExpression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Sub-expression removed successfully');

        // Update the local copy of the combined rule
        removeSubExpressionFromLocalRule(window.currentCombinedRule.ast, path);

        // Update the rule string display
        document.getElementById('combinedRuleStringDisplay').innerText = `Combined Rule String: ${reconstructRuleString(window.currentCombinedRule.ast)}`;

    } catch (error) {
        displayError(error.message);
    }
}

async function evaluateCombinedRuleByName() {
    const userDataText = document.getElementById('combinedUserData').value;
    const name = document.getElementById('evaluateCombinedRuleName').value;

    if (!name) {
        alert('Please enter the combined rule name to evaluate.');
        return;
    }

    let userData;
    try {
        userData = JSON.parse(userDataText);
    } catch (e) {
        displayError('Invalid JSON in user data.');
        return;
    }

    try {
        const response = await fetch(`${multiApiUrl}/evaluateByName`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userData })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        document.getElementById('combinedResult').innerText =
            result.eligible ? 'User is eligible' : 'User is not eligible';
    } catch (error) {
        displayError(error.message);
    }
}

// Helper Functions
function modifyOperatorInLocalRule(ast, path, newOperator) {
    const node = getNodeByPath(ast, path);
    if (node && node.operator) {
        node.operator = newOperator.toUpperCase();
    }
}

function modifyOperandInLocalRule(ast, path, newValue) {
    const node = getNodeByPath(ast, path);
    if (node && node.type === 'operand') {
        node.value = newValue;
    }
}

function addSubExpressionToLocalRule(ast, path, newExpressionAST, operator) {
    const node = getNodeByPath(ast, path);
    if (node) {
        const combined = {
            type: 'logical',
            operator: operator.toUpperCase(),
            left: node,
            right: newExpressionAST
        };
        setNodeByPath(ast, path, combined);
    }
}

function removeSubExpressionFromLocalRule(ast, path) {
    const parentPath = path.slice(0, -1);
    const parentNode = getNodeByPath(ast, parentPath);
    const key = path[path.length - 1];

    if (parentNode && parentNode[key]) {
        const siblingKey = key === 'left' ? 'right' : 'left';
        const siblingNode = parentNode[siblingKey];
        setNodeByPath(ast, parentPath, siblingNode);
    }
}

function getNodeByPath(ast, path) {
    return path.reduce((node, key) => (node ? node[key] : null), ast);
}

function setNodeByPath(ast, path, newNode) {
    let node = ast;
    for (let i = 0; i < path.length - 1; i++) {
        node = node[path[i]];
        if (!node) {
            return;
        }
    }
    node[path[path.length - 1]] = newNode;
}

function reconstructRuleString(ast) {
    if (ast.type === 'logical' || ast.type === 'comparison') {
        const left = reconstructRuleString(ast.left);
        const right = reconstructRuleString(ast.right);
        return `(${left} ${ast.operator} ${right})`;
    } else if (ast.type === 'operand') {
        return ast.value;
    }
    return '';
}

function createASTFromString(ruleString) {
    // This function mimics the createAST function from backend/services/ast.js
    try {
        const expression = jsep(ruleString);
        return convertToCustomAST(expression);
    } catch (error) {
        throw new Error(`Invalid rule string: ${error.message}`);
    }
}

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
        return { type: 'operand', value: node.name };
    } else {
        throw new Error(`Unsupported node type: ${node.type}`);
    }
}

async function saveRule() {
    const name = document.getElementById('modifyRuleName').value;

    if (!name) {
        alert('Please enter the rule name.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ast: window.currentRule.ast })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Rule saved successfully.');
    } catch (error) {
        displayError(error.message);
    }
}

async function saveCombinedRule() {
    const name = document.getElementById('modifyCombinedRuleName').value;

    if (!name) {
        alert('Please enter the combined rule name.');
        return;
    }

    try {
        const response = await fetch(`${multiApiUrl}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ast: window.currentCombinedRule.ast })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert('Combined rule saved successfully.');
    } catch (error) {
        displayError(error.message);
    }
}

