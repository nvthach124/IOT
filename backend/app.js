/**
 * API Endpoints (3 endpoints):
 * - POST /api/device-control    
 * - GET  /api/active-history     
 * - GET  /api/data-sensor        
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const deviceControlRoutes = require('./routes/deviceControlRoutes');
const historyRoutes = require('./routes/historyRoutes');
const sensorRoutes = require('./routes/sensorRoutes');

// Khởi tạo Express app
const app = express();

// ===== MIDDLEWARE =====

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString('vi-VN');
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ===== API ROUTES (3 endpoints) =====

app.use('/api/device-control', deviceControlRoutes);
app.use('/api/active-history', historyRoutes);
app.use('/api/data-sensor', sensorRoutes);


// ===== FRONTEND ROUTES =====

app.get('/', (req, res) => {
    res.redirect('/dashboard.html');
});


app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
});

module.exports = app;
