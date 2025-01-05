const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
    origin: '*',  // Be careful with this in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Routes
app.get('/api/test', (req, res) => {
    console.log('API test endpoint hit');
    res.json({ message: 'Frontend and Backend are connected!' });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
