const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Only Admins and Management can inspect audit trails
router.get('/', authMiddleware, authorizeRoles('Admin', 'Management'), getAuditLogs);

module.exports = router;
