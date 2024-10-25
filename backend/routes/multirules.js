// backend/routes/multirules.js

const express = require('express');
const router = express.Router();
const CombinedRule = require('../models/CombinedRule');
const {
    createAST,
    combineASTs,
    evaluateAST,
    modifyOperator,
    modifyOperandValue,
    addSubExpression,
    removeSubExpression
} = require('../services/ast');

// Create a new combined rule
router.post('/create', async (req, res, next) => {
    try {
        const { name, ruleStrings, operator = 'AND' } = req.body;

        // Check if combined rule name already exists
        const existingCombinedRule = await CombinedRule.findOne({ name });
        if (existingCombinedRule) {
            return res.status(400).json({ message: 'Combined rule with this name already exists' });
        }

        const asts = [];
        for (const ruleString of ruleStrings) {
            const ast = createAST(ruleString);
            if (!ast) {
                return res.status(400).json({ message: `Invalid rule string: ${ruleString}` });
            }
            asts.push(ast);
        }

        const combinedAST = combineASTs(asts, operator);

        const newCombinedRule = new CombinedRule({ name, ruleStrings, operator, ast: combinedAST });
        await newCombinedRule.save();

        res.json({ message: 'Combined rule added successfully', combinedRule: newCombinedRule });
    } catch (error) {
        next(error);
    }
});

// Fetch a combined rule by name
router.get('/:name', async (req, res, next) => {
    try {
        const { name } = req.params;
        const combinedRule = await CombinedRule.findOne({ name });
        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }
        res.json(combinedRule);
    } catch (error) {
        next(error);
    }
});

// Modify an existing combined rule's operator
router.post('/modifyOperator', async (req, res, next) => {
    try {
        const { name, path, newOperator } = req.body;

        const combinedRule = await CombinedRule.findOne({ name });
        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }

        modifyOperator(combinedRule.ast, path, newOperator);

        // Save the updated combined rule
        await CombinedRule.updateOne({ name }, { ast: combinedRule.ast });

        res.json({ message: 'Operator modified successfully', combinedRule });
    } catch (error) {
        next(error);
    }
});

// Modify an existing combined rule's operand value
router.post('/modifyOperand', async (req, res, next) => {
    try {
        const { name, path, newValue } = req.body;

        const combinedRule = await CombinedRule.findOne({ name });
        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }

        modifyOperandValue(combinedRule.ast, path, newValue);

        // Save the updated combined rule
        await CombinedRule.updateOne({ name }, { ast: combinedRule.ast });

        res.json({ message: 'Operand value modified successfully', combinedRule });
    } catch (error) {
        next(error);
    }
});

// Add sub-expression to an existing combined rule
router.post('/addSubExpression', async (req, res, next) => {
    try {
        const { name, path, newExpressionString, operator } = req.body;

        const combinedRule = await CombinedRule.findOne({ name });
        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }

        const newExpressionAST = createAST(newExpressionString);

        addSubExpression(combinedRule.ast, path, newExpressionAST, operator);

        // Save the updated combined rule
        await CombinedRule.updateOne({ name }, { ast: combinedRule.ast });

        res.json({ message: 'Sub-expression added successfully', combinedRule });
    } catch (error) {
        next(error);
    }
});

// Remove sub-expression from an existing combined rule
router.post('/removeSubExpression', async (req, res, next) => {
    try {
        const { name, path } = req.body;

        const combinedRule = await CombinedRule.findOne({ name });
        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }

        removeSubExpression(combinedRule.ast, path);

        // Save the updated combined rule
        await CombinedRule.updateOne({ name }, { ast: combinedRule.ast });

        res.json({ message: 'Sub-expression removed successfully', combinedRule });
    } catch (error) {
        next(error);
    }
});

// Evaluate combined rules by name
router.post('/evaluateByName', async (req, res, next) => {
    try {
        const { name, userData } = req.body;

        const combinedRule = await CombinedRule.findOne({ name });

        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }

        const isEligible = evaluateAST(combinedRule.ast, userData);
        res.json({ eligible: isEligible });
    } catch (error) {
        next(error);
    }
});

// Save the modified combined rule
router.post('/save', async (req, res, next) => {
    try {
        const { name, ast } = req.body;

        const combinedRule = await CombinedRule.findOne({ name });
        if (!combinedRule) {
            return res.status(404).json({ message: 'Combined rule not found' });
        }

        // Update the AST in the database
        await CombinedRule.updateOne({ name }, { ast });

        res.json({ message: 'Combined rule saved successfully' });
    } catch (error) {
        next(error);
    }
});


module.exports = router;
