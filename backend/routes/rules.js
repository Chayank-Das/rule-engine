// backend/routes/rules.js

const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const {
    createAST,
    evaluateAST,
    modifyOperator,
    modifyOperandValue,
    addSubExpression,
    removeSubExpression
} = require('../services/ast');

// Create a new rule
router.post('/create', async (req, res, next) => {
    try {
        const { name, ruleString } = req.body;

        // Check if rule name already exists
        const existingRule = await Rule.findOne({ name });
        if (existingRule) {
            return res.status(400).json({ message: 'Rule with this name already exists' });
        }

        const ast = createAST(ruleString);

        const newRule = new Rule({ name, ruleString, ast });
        await newRule.save();

        res.json({ message: 'Rule added successfully', rule: newRule });
    } catch (error) {
        next(error);
    }
});

// Fetch a rule by name
router.get('/:name', async (req, res, next) => {
    try {
        const { name } = req.params;
        const rule = await Rule.findOne({ name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.json(rule);
    } catch (error) {
        next(error);
    }
});

// Modify an existing rule's operator
router.post('/modifyOperator', async (req, res, next) => {
    try {
        const { name, path, newOperator } = req.body;

        const rule = await Rule.findOne({ name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        modifyOperator(rule.ast, path, newOperator);

        // Save the updated rule
        await Rule.updateOne({ name }, { ast: rule.ast });

        res.json({ message: 'Operator modified successfully', rule });
    } catch (error) {
        next(error);
    }
});

// Modify an existing rule's operand value
router.post('/modifyOperand', async (req, res, next) => {
    try {
        const { name, path, newValue } = req.body;

        const rule = await Rule.findOne({ name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        modifyOperandValue(rule.ast, path, newValue);

        // Save the updated rule
        await Rule.updateOne({ name }, { ast: rule.ast });

        res.json({ message: 'Operand value modified successfully', rule });
    } catch (error) {
        next(error);
    }
});

// Add sub-expression to an existing rule
router.post('/addSubExpression', async (req, res, next) => {
    try {
        const { name, path, newExpressionString, operator } = req.body;

        const rule = await Rule.findOne({ name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        const newExpressionAST = createAST(newExpressionString);

        addSubExpression(rule.ast, path, newExpressionAST, operator);

        // Save the updated rule
        await Rule.updateOne({ name }, { ast: rule.ast });

        res.json({ message: 'Sub-expression added successfully', rule });
    } catch (error) {
        next(error);
    }
});

// Remove sub-expression from an existing rule
router.post('/removeSubExpression', async (req, res, next) => {
    try {
        const { name, path } = req.body;

        const rule = await Rule.findOne({ name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        removeSubExpression(rule.ast, path);

        // Save the updated rule
        await Rule.updateOne({ name }, { ast: rule.ast });

        res.json({ message: 'Sub-expression removed successfully', rule });
    } catch (error) {
        next(error);
    }
});

// Evaluate a rule by name
router.post('/evaluateByName', async (req, res, next) => {
    try {
        const { name, userData } = req.body;

        const rule = await Rule.findOne({ name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        const isEligible = evaluateAST(rule.ast, userData);
        res.json({ eligible: isEligible });
    } catch (error) {
        next(error);
    }
});

// Save the modified rule
// Save the modified rule
router.post('/save', async (req, res, next) => {
    try {
        const { name, ast } = req.body;

        console.log(`Received save request for rule: ${name}`);

        const rule = await Rule.findOne({ name });
        if (!rule) {
            console.error(`Rule not found with name: ${name}`);
            return res.status(404).json({ message: 'Rule not found' });
        }

        // Update the AST in the database
        const updateResult = await Rule.updateOne({ name }, { $set: { ast } });
        console.log(`Update result:`, updateResult);

        res.json({ message: 'Rule saved successfully' });
    } catch (error) {
        console.error(`Error saving rule: ${error.message}`);
        next(error);
    }
});



module.exports = router;
