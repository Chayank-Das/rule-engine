// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const ruleRoutes = require('./routes/rules');
const multiruleRoutes = require('./routes/multirules');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const uri = 'mongodb+srv://<username>:<password>@cluster0.ex2o7.mongodb.net/<databaseName>?retryWrites=true&w=majority';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/rules', ruleRoutes);
app.use('/api/multirules', multiruleRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(400).json({ message: err.message });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
