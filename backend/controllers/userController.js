const bcrypt = require('bcryptjs');
const { dbAll, dbGet, dbRun } = require('../config/db');

// List all users
const getAllUsers = async (req, res) => {
  try {
    const users = await dbAll('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

// Create a new user (Admin only)
const createUser = async (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ message: 'Name, email, role, and password are required.' });
  }

  try {
    // Check if email already exists
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ message: `A user with email '${email}' already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await dbRun(
      'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
      [name, email, role, hashedPassword]
    );

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};

// Update user details (Admin only)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required.' });
  }

  try {
    const user = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check email clash
    const emailClash = await dbGet('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (emailClash) {
      return res.status(400).json({ message: `Email '${email}' is already in use by another user.` });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await dbRun(
        'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
        [name, email, role, hashedPassword, id]
      );
    } else {
      await dbRun(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
    }

    res.json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.' });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await dbGet('SELECT id, email FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent deleting oneself
    if (user.email === req.user.email) {
      return res.status(400).json({ message: 'You cannot delete your own administrative account.' });
    }

    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
