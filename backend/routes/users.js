const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// View users list: Admin and Management roles
router.get('/', authMiddleware, authorizeRoles('Admin', 'Management'), getAllUsers);

// CRUD operations on accounts: Admin only
router.post('/', authMiddleware, authorizeRoles('Admin'), createUser);
router.put('/:id', authMiddleware, authorizeRoles('Admin'), updateUser);
router.delete('/:id', authMiddleware, authorizeRoles('Admin'), deleteUser);

module.exports = router;
