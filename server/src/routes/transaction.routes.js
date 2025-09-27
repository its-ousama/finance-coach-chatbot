const express = require('express');
const { getTransactions, createTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTransactions);
router.post('/', protect, createTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;