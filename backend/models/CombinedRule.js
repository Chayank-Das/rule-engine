// backend/models/CombinedRule.js

const mongoose = require('mongoose');

const combinedRuleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Unique name for the combined rule
    ruleStrings: [String], // Array of original rule strings
    operator: { type: String, default: 'AND' }, // Operator used to combine rules
    ast: Object            // Combined AST representation
});

module.exports = mongoose.model('CombinedRule', combinedRuleSchema);
