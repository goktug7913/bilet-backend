import 'module-alias/register';
const express = require('express');
const auth = require('@/middleware/jwt').auth;
import dbSeeder from "@/utils/dbSeeder";

const PORT = process.env.PORT || 80;

const app = express();

app.use(express.json());
app.disable('x-powered-by');

dbSeeder(); // Seed database if first run

// Login and register routes
app.use('/api/auth', require('@/routes/auth'));

// Protected routes
app.use('/api/sefer',auth, require('@/routes/sefer'));
app.use('/api/bilet',auth, require('@/routes/bilet'));

// Start server
app.listen(PORT, () => console.log(`Sunucu aktif, Port: ${PORT}`));