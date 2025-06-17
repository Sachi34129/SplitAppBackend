const express = require('express');
const router = express.Router();
const balancesController = require('../controllers/balancesController');

router.get('/', balancesController.getBalances);

module.exports = router;