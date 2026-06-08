const express = require('express');
const router = express.Router();
const {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getDashboardStats,
  getReportsData
} = require('../controllers/contractController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Dashboard statistics
router.get('/dashboard', authMiddleware, getDashboardStats);

// Reports summary statistics
router.get('/reports', authMiddleware, getReportsData);

// Basic CRUD
router.get('/', authMiddleware, getAllContracts);
router.get('/:id', authMiddleware, getContractById);

// Creation and Update: Admin and Relationship Managers only
router.post('/', authMiddleware, authorizeRoles('Admin', 'Relationship Manager'), createContract);
router.put('/:id', authMiddleware, authorizeRoles('Admin', 'Relationship Manager'), updateContract);

// Delete: Admin only
router.delete('/:id', authMiddleware, authorizeRoles('Admin'), deleteContract);

module.exports = router;
