const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.status(200).json({ status: 'healthy', db: 'connected' });
    } else {
      res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

module.exports = router;
