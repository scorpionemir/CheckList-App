const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const managerMiddleware = require("../middleware/managerMiddleware");

const {
    createChecklist,
    getMyChecklists,
    getMyChecklistsByType,
    getMyChecklistById,
    setChecklistEditPermission,
    updateChecklist,
    getAllSubmittedChecklists
} = require("../controllers/checklistsController");


// =====================================================
// Create checklist
// =====================================================

router.post(
    "/",
    authMiddleware,
    createChecklist
);


// =====================================================
// Get my checklists
// =====================================================

router.get(
    "/",
    authMiddleware,
    getMyChecklists
);


// =====================================================
// Get my checklists by type
// =====================================================

router.get(
    "/type/:checklistTypeId",
    authMiddleware,
    getMyChecklistsByType
);


router.get(
    "/manager/all",
    authMiddleware,
    managerMiddleware,
    getAllSubmittedChecklists
);

// =====================================================
// Grant / revoke edit permission
// Manager only
// =====================================================

router.patch(
    "/:id/edit-permission",
    authMiddleware,
    managerMiddleware,
    setChecklistEditPermission
);


// =====================================================
// Update saved checklist
// User only / owner + permission
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    updateChecklist
);


// =====================================================
// Get checklist by ID
// =====================================================

router.get(
    "/:id",
    authMiddleware,
    getMyChecklistById
);


module.exports = router;