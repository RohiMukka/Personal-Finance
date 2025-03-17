const express = require('express');
const router = express.Router();

// GET all categories
router.get('/', (req, res) => {
  res.json({ message: 'Get all categories endpoint' });
});

// Other category routes will go here

module.exports = router;