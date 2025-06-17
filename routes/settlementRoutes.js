const express = require('express');
const router = express.Router();
const { getSettlement } = require('../controllers/settlementController');

router.get('/', getSettlement);

module.exports = router;