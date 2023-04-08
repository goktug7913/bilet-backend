const express = require('express');
import { handleGetSefer, handleGetDetails} from '@/handlers/sefer';

const router = express.Router();

router.get('/', handleGetSefer);
router.get('/detay', handleGetDetails);


module.exports = router;

export {}; // This is required to prevent errors when compiling TypeScript files