const express = require("express");
const { auth, admin } = require("../middleware/auth");
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} = require("../controllers/destination.controller");

const router = express.Router();

// Public routes
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);

// Admin only routes
// router.post("/", auth, admin, createDestination);
// router.put("/:id", auth, admin, updateDestination);
// router.delete("/:id", auth, admin, deleteDestination);

module.exports = router;
