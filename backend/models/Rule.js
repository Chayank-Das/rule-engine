// backend/models/Rule.js

const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Unique name for the rule
    ruleString: String,  // Original rule string
    ast: Object          // Parsed AST representation
});

module.exports = mongoose.model('Rule', ruleSchema);
