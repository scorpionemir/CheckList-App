
const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAuditLogs } = require("../controllers/auditLogsController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    roleMiddleware("manager", "admin"),
    getAuditLogs
);

module.exports = router;
