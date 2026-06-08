const { dbAll } = require('../config/db');

const getAuditLogs = async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs.' });
  }
};

module.exports = {
  getAuditLogs
};
