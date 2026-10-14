
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createChecklist,
    getMyChecklists,
    getMyChecklistsByType,
    getMyChecklistById,
    setChecklistEditPermission,
    updateChecklist,
    getAllSubmittedChecklists,
    getTrashChecklists,
    restoreChecklist,
    deleteChecklist,
} = require("../controllers/checklistsController");

// Contractor: create their own checklist
router.post(
    "/",
    authMiddleware,
    roleMiddleware("contractor"),
    createChecklist
);

// Manager and Admin: view submitted checklists
router.get(
    "/manager/all",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    getAllSubmittedChecklists
);

// Manager and Admin: view deleted checklists
router.get(
    "/trash",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    getTrashChecklists
);

// Manager and Admin: restore a deleted checklist
router.patch(
    "/:id/restore",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    restoreChecklist
);

// Contractor: view their checklists by type
router.get(
    "/type/:checklistTypeId",
    authMiddleware,
    roleMiddleware("contractor"),
    getMyChecklistsByType
);

// Contractor: view their own checklists
router.get(
    "/",
    authMiddleware,
    roleMiddleware("contractor"),
    getMyChecklists
);

// Manager and Admin: grant or revoke edit permission
router.patch(
    "/:id/edit-permission",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    setChecklistEditPermission
);

// Manager, Admin, or authorized Contractor: update a checklist
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin", "contractor"),
    updateChecklist
);

// Manager and Admin: soft-delete a checklist
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    deleteChecklist
);

// Manager, Admin, or Contractor: view checklist details
// The controller enforces contractor ownership.
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin", "contractor"),
    getMyChecklistById
);

module.exports = router;
