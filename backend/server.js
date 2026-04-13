// ============================================
// Spark Nurses Academy — Express Server
// ============================================

const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CORS (allow frontend requests) ---
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// --- Serve frontend static files ---
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- API Routes ---
app.use('/api/auth', authRoutes);

// --- Health check ---
app.get('/', (req, res) => {
    res.json({ status: 'Spark Nurses Academy API is running' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
