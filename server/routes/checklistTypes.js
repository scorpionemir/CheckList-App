const express = require("express");

const {
    getChecklistTypes,
    getChecklistTypeById,
    createChecklistType,
    updateChecklistType,
} = require("../controllers/checklistTypesController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Read checklist types
router.get("/", authMiddleware, getChecklistTypes);
router.get("/:id", authMiddleware, getChecklistTypeById);

// Only Manager and Admin can create or update checklist types
router.post(
    "/",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    createChecklistType
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    updateChecklistType
);

module.exports = router;