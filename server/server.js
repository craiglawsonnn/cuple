require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const FridgeItem = require('./models/FridgeItem');

const app = express();

// MongoDB connection
const mongoUri = process.env.MONGO_URI.replace('${MONGO_PASSWORD}', process.env.MONGO_PASSWORD);
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if we can't connect to the database
});

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

// Add this middleware to set headers for all responses
app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    next();
});

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Fridge routes
app.get('/api/fridge', async (req, res) => {
    try {
        const items = await FridgeItem.find().sort({ createdAt: -1 });
        console.log('Current inventory:', items);
        res.json(items);
    } catch (error) {
        console.error('Error fetching fridge items:', error);
        res.status(500).json({ error: 'Failed to fetch fridge items' });
    }
});

app.post('/api/fridge', async (req, res) => {
    try {
        const { ingredient, quantity } = req.body;
        if (!ingredient) {
            return res.status(400).json({ error: 'Ingredient is required' });
        }
        if (!quantity || !quantity.value || !quantity.unit) {
            return res.status(400).json({ error: 'Quantity and unit are required' });
        }

        const normalizedIngredient = ingredient.trim().toLowerCase();
        
        // Check if ingredient already exists
        let item = await FridgeItem.findOne({ 
            name: { $regex: new RegExp(`^${normalizedIngredient}$`, 'i') }
        });

        if (item) {
            return res.status(400).json({ 
                error: 'Ingredient already exists in fridge'
            });
        }

        // Create new ingredient
        item = new FridgeItem({ 
            name: normalizedIngredient,
            quantity: {
                value: quantity.value,
                unit: quantity.unit
            }
        });
        await item.save();
        
        // Get updated list
        const items = await FridgeItem.find().sort({ createdAt: -1 });
        console.log('Added ingredient:', normalizedIngredient);
        
        res.status(201).json({ 
            message: `${normalizedIngredient} added to fridge`,
            fridge: items
        });
    } catch (error) {
        console.error('Error adding ingredient:', error);
        res.status(500).json({ error: 'Failed to add ingredient' });
    }
});

app.delete('/api/fridge', async (req, res) => {
    try {
        const { ingredient } = req.body;
        const result = await FridgeItem.findOneAndDelete({ 
            name: { $regex: new RegExp(`^${ingredient}$`, 'i') }
        });

        if (!result) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        // Get updated list
        const items = await FridgeItem.find().sort({ createdAt: -1 });
        console.log('Removed ingredient:', ingredient);
        
        res.json({ 
            message: `${ingredient} removed from fridge`,
            fridge: items
        });
    } catch (error) {
        console.error('Error removing ingredient:', error);
        res.status(500).json({ error: 'Failed to remove ingredient' });
    }
});

const { Configuration, OpenAIApi } = require('openai');

// GPT API Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Store your API key in the .env file
});
const openai = new OpenAIApi(configuration);

app.get('/api/recipes', async (req, res) => {
    try {
        // Fetch ingredients from MongoDB
        const items = await FridgeItem.find();
        if (items.length === 0) {
            return res.json({ recipes: [] });
        }

        const ingredients = items.map(item => item.name).join(', ');

        // Create the GPT prompt
        const prompt = `
            You are a recipe suggestion assistant. Based on the following ingredients in the fridge: ${ingredients}, suggest 3 creative and easy-to-make recipes. Include the name of the recipe, ingredients, and step-by-step instructions.
        `;

        // Send the request to the GPT API
        const gptResponse = await openai.createCompletion({
            model: 'text-davinci-003', // Or 'gpt-4' if available
            prompt: prompt,
            max_tokens: 500, // Adjust the token limit based on the response size
            temperature: 0.7,
        });

        const recipes = gptResponse.data.choices[0].text.trim();
        res.json({ recipes }); // Send the generated recipes to the frontend
    } catch (error) {
        console.error('Error fetching recipes from GPT:', error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is reachable' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    // Ensure we haven't already sent a response
    if (!res.headersSent) {
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message 
        });
    }
});

// Add a catch-all route for unmatched routes (404)
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.url} not found` });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
        }
        process.exit(1);
    }
    console.log(`Server running on http://localhost:${PORT}`);
});
