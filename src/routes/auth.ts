const express = require('express');
import { handleLogin, handleRegister } from '@/handlers/auth';

const router = express.Router();

router.post('/login', handleLogin);
router.post('/register', handleRegister);

module.exports = router;

export {}; // This is required to prevent errors when compiling TypeScript files