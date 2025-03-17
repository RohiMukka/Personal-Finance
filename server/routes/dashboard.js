const express = require('express');
const router = express.Router();

// GET dashboard data
router.get('/', (req, res) => {
  res.json({ message: 'Get dashboard data endpoint' });
});

// Other dashboard routes will go here

module.exports = router;