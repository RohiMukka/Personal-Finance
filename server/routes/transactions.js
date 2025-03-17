const express = require('express');
const router = express.Router();

// GET all transactions
router.get('/', (req, res) => {
  res.json({ message: 'Get all transactions endpoint' });
});

// POST a new transaction
router.post('/', (req, res) => {
  res.json({ message: 'Create transaction endpoint' });
});

// Other transaction routes will go here

module.exports = router;