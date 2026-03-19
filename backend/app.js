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

const errorHandler = require('./middlewares/errorHandler');

// Import routes
const router = require('./routes');

// Khởi tạo Express app
const app = express();

// ===== MIDDLEWARE =====

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString('vi-VN');
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ===== API ROUTES  =====
app.use('/api', router);

// ===== FRONTEND ROUTES (SPA fallback) =====

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/docs/')) return next();
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ===== GLOBAL ERROR HANDLER =====
app.use(errorHandler);

module.exports = app;
