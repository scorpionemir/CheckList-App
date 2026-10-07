const express = require("express");

const {
    getChecklistTypes,
    getChecklistTypeById,
    createChecklistType,
    updateChecklistType
} = require("../controllers/checklistTypesController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// Get all checklist types
router.get("/", authenticateToken, getChecklistTypes);


// Get one checklist type
router.get("/:id", authenticateToken, getChecklistTypeById);


// Create checklist type
router.post("/", authenticateToken, createChecklistType);


// Update checklist type
router.put("/:id", authenticateToken, updateChecklistType);


module.exports = router;