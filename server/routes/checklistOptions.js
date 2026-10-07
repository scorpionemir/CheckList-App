const express = require("express");

const {
    getChecklistOptions,
    getChecklistOptionById,
    createChecklistOption,
    updateChecklistOption,
    deactivateChecklistOption
} = require("../controllers/checklistOptionsController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// Get checklist options
router.get("/", authenticateToken, getChecklistOptions);


// Get one option
router.get("/:id", authenticateToken, getChecklistOptionById);


// Create option
router.post(
    "/",
    authenticateToken,
    createChecklistOption
);

// Update option
router.put("/:id", authenticateToken, updateChecklistOption);

router.patch(
    "/:id/deactivate",
    authenticateToken,
    deactivateChecklistOption
);

module.exports = router;