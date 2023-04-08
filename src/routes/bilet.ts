const express = require('express');
import { handleGetBilet, handleCreateBilet, handleGetDetails} from '@/handlers/bilet';

const router = express.Router();

router.get('/biletlerim', handleGetBilet);
router.post('/satis', handleCreateBilet);
router.get('/detay', handleGetDetails);

module.exports = router;

export {}; // This is required to prevent errors when compiling TypeScript files