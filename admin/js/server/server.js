require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '50mb' }));

// CORS Configuration
const corsOptions = {
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://extramilesenergy.github.io',
        'https://milly-sheiklike-radically.ngrok-free.dev'
    ],
    credentials: true
};

app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET || 'extra-miles-energy-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// OTP Store
const otpStore = new Map();

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is running!', 
        time: new Date().toISOString() 
    });
});

// Send OTP
app.post('/api/send-otp', async (req, res) => {
    console.log("📱 Send OTP called");
    
    const otp = crypto.randomInt(100000, 999999).toString();
    const chatId = process.env.ADMIN_CHAT_ID;
    
    if (!chatId) {
        return res.status(500).json({ error: 'Admin chat ID not configured' });
    }
    
    otpStore.set(chatId, { 
        otp, 
        expires: Date.now() + 5 * 60 * 1000 
    });

    try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `🔐 Extra Miles Energy Admin Login\n\nYour OTP is: ${otp}\n\nValid for 5 minutes.`
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
    console.log("🔑 Verify OTP called");
    
    const { otp } = req.body;
    const chatId = process.env.ADMIN_CHAT_ID;
    const record = otpStore.get(chatId);
    
    if (!record) {
        return res.status(400).json({ error: 'No OTP found' });
    }
    
    if (record.expires < Date.now()) {
        otpStore.delete(chatId);
        return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (record.otp === otp) {
        req.session.isAdmin = true;
        otpStore.delete(chatId);
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check Auth
app.get('/api/check-auth', (req, res) => {
    res.json({ isAdmin: req.session.isAdmin || false });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📱 Telegram bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'MISSING!'}`);
    console.log(`👤 Admin Chat ID: ${process.env.ADMIN_CHAT_ID || 'MISSING!'}`);
});
