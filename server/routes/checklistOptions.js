const express = require("express");

const {
    getChecklistOptions,
    getChecklistOptionById,
    createChecklistOption,
    updateChecklistOption,
    deactivateChecklistOption,
} = require("../controllers/checklistOptionsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Read checklist options
router.get("/", authMiddleware, getChecklistOptions);
router.get("/:id", authMiddleware, getChecklistOptionById);

// Only Manager and Admin can manage options
router.post(
    "/",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    createChecklistOption
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    updateChecklistOption
);

router.patch(
    "/:id/deactivate",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    deactivateChecklistOption
);

module.exports = router;