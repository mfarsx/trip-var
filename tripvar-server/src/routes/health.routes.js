const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Basic health check
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.json({ status: 'ok', database: 'connected' });
    } else {
      res.status(503).json({ status: 'error', database: 'disconnected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
