const { dbAll, dbGet, dbRun } = require('../config/db');

// Helper to log changes to audit_logs table
const logAudit = async (contractId, action, performedBy) => {
  try {
    await dbRun(
      'INSERT INTO audit_logs (contract_id, action, performed_by, timestamp) VALUES (?, ?, ?, datetime("now"))',
      [contractId, action, performedBy]
    );
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

// 1. Get all contracts with search, sort, filter & pagination
const getAllContracts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      manager = '',
      category = '',
      sortBy = 'end_date',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contracts WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (academy_name LIKE ? OR contract_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (manager) {
      query += ' AND relationship_manager = ?';
      params.push(manager);
    }

    if (category) {
      query += ' AND equipment_category = ?';
      params.push(category);
    }

    // Sorting - sanitize field names to prevent SQL injection
    const allowedSortFields = ['contract_id', 'academy_name', 'equipment_category', 'contract_value', 'end_date', 'renewal_date', 'price_revision', 'relationship_manager', 'status'];
    const actualSortField = allowedSortFields.includes(sortBy) ? sortBy : 'end_date';
    const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    query += ` ORDER BY ${actualSortField} ${actualSortOrder}`;

    // Get total count for pagination headers
    let countQuery = 'SELECT COUNT(*) as count FROM contracts WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (academy_name LIKE ? OR contract_id LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (manager) {
      countQuery += ' AND relationship_manager = ?';
      countParams.push(manager);
    }
    if (category) {
      countQuery += ' AND equipment_category = ?';
      countParams.push(category);
    }

    const countResult = await dbGet(countQuery, countParams);
    const totalItems = countResult.count;
    const totalPages = Math.ceil(totalItems / limit);

    // Apply pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const contracts = await dbAll(query, params);

    res.json({
      contracts,
      pagination: {
        totalItems,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Error fetching contracts list.' });
  }
};

// 2. Get contract by ID
const getContractById = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await dbGet('SELECT * FROM contracts WHERE id = ?', [id]);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    // Get audit logs for this contract
    const auditLogs = await dbAll(
      'SELECT * FROM audit_logs WHERE contract_id = ? ORDER BY timestamp DESC',
      [contract.contract_id]
    );

    res.json({ contract, auditLogs });
  } catch (error) {
    console.error('Error fetching contract details:', error);
    res.status(500).json({ message: 'Error fetching contract details.' });
  }
};

// 3. Create Contract
const createContract = async (req, res) => {
  const {
    contract_id,
    academy_name,
    equipment_category,
    contract_value,
    start_date,
    end_date,
    renewal_date,
    price_revision,
    relationship_manager,
    contact_person,
    contact_number,
    email,
    notes,
    status
  } = req.body;

  // Form Validation
  if (!contract_id || !academy_name || !equipment_category || !contract_value || !start_date || !end_date || !renewal_date || !relationship_manager || !contact_person || !contact_number || !email || !status) {
    return res.status(400).json({ message: 'All fields except notes are required.' });
  }

  try {
    // Check if ID is unique
    const existing = await dbGet('SELECT id FROM contracts WHERE contract_id = ?', [contract_id]);
    if (existing) {
      return res.status(400).json({ message: `Contract ID '${contract_id}' already exists.` });
    }

    await dbRun(`
      INSERT INTO contracts (
        contract_id, academy_name, equipment_category, contract_value,
        start_date, end_date, renewal_date, price_revision,
        relationship_manager, contact_person, contact_number, email,
        notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
    `, [
      contract_id, academy_name, equipment_category, parseFloat(contract_value),
      start_date, end_date, renewal_date, parseFloat(price_revision || 0),
      relationship_manager, contact_person, contact_number, email,
      notes || '', status
    ]);

    await logAudit(contract_id, 'Contract created', req.user.name);

    res.status(201).json({ message: 'Contract created successfully', contract_id });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Error creating contract.' });
  }
};

// 4. Update Contract
const updateContract = async (req, res) => {
  const { id } = req.params;
  const {
    academy_name,
    equipment_category,
    contract_value,
    start_date,
    end_date,
    renewal_date,
    price_revision,
    relationship_manager,
    contact_person,
    contact_number,
    email,
    notes,
    status
  } = req.body;

  if (!academy_name || !equipment_category || !contract_value || !start_date || !end_date || !renewal_date || !relationship_manager || !contact_person || !contact_number || !email || !status) {
    return res.status(400).json({ message: 'All required fields must be supplied.' });
  }

  try {
    const contract = await dbGet('SELECT contract_id, status, contract_value FROM contracts WHERE id = ?', [id]);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    await dbRun(`
      UPDATE contracts SET
        academy_name = ?,
        equipment_category = ?,
        contract_value = ?,
        start_date = ?,
        end_date = ?,
        renewal_date = ?,
        price_revision = ?,
        relationship_manager = ?,
        contact_person = ?,
        contact_number = ?,
        email = ?,
        notes = ?,
        status = ?,
        updated_at = datetime("now")
      WHERE id = ?
    `, [
      academy_name, equipment_category, parseFloat(contract_value),
      start_date, end_date, renewal_date, parseFloat(price_revision || 0),
      relationship_manager, contact_person, contact_number, email,
      notes || '', status, id
    ]);

    // Check what changed to add detail to audit logs
    let changes = [];
    if (contract.status !== status) changes.push(`status changed from '${contract.status}' to '${status}'`);
    if (contract.contract_value !== parseFloat(contract_value)) changes.push(`value changed from $${contract.contract_value} to $${contract_value}`);
    const changeLog = changes.length > 0 ? `Contract updated: ${changes.join(', ')}` : 'Contract metadata updated';

    await logAudit(contract.contract_id, changeLog, req.user.name);

    res.json({ message: 'Contract updated successfully' });
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ message: 'Error updating contract.' });
  }
};

// 5. Delete Contract
const deleteContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await dbGet('SELECT contract_id FROM contracts WHERE id = ?', [id]);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    await dbRun('DELETE FROM contracts WHERE id = ?', [id]);
    await logAudit(contract.contract_id, 'Contract deleted', req.user.name);

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ message: 'Error deleting contract.' });
  }
};

// 6. Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    // Current date for comparison
    const baseDate = '2026-06-08'; // System reference date

    // Overall metrics
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Renewed' THEN 1 ELSE 0 END) as renewed,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
      FROM contracts
    `;
    const stats = await dbGet(statsQuery);

    // Expiring soon: Active contracts expiring within 90 days from 2026-06-08
    const expiringSoonQuery = `
      SELECT COUNT(*) as count 
      FROM contracts 
      WHERE status = 'Active' 
      AND end_date >= ?
      AND end_date <= date(?, '+90 days')
    `;
    const expiringSoonRes = await dbGet(expiringSoonQuery, [baseDate, baseDate]);
    const expiringSoonCount = expiringSoonRes.count;

    // Upcoming renewals list (within 90 days)
    const upcomingRenewals = await dbAll(`
      SELECT id, contract_id, academy_name, end_date, renewal_date, relationship_manager, contract_value, status
      FROM contracts
      WHERE status = 'Active'
      AND end_date >= ?
      AND end_date <= date(?, '+90 days')
      ORDER BY end_date ASC
      LIMIT 5
    `, [baseDate, baseDate]);

    // Recent activities (last 5 audit logs)
    const recentActivities = await dbAll(`
      SELECT id, contract_id, action, performed_by, timestamp
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 6
    `);

    // Contract Status Distribution (for Pie Chart)
    const statusDistribution = await dbAll(`
      SELECT status as name, COUNT(*) as value 
      FROM contracts 
      GROUP BY status
    `);

    // Monthly Renewal Trend (contracts expiring / renewing by month in next 6 months)
    // We group by YYYY-MM based on end_date
    const monthlyTrend = await dbAll(`
      SELECT 
        strftime('%Y-%m', end_date) as month,
        COUNT(*) as count,
        SUM(contract_value) as value
      FROM contracts
      WHERE end_date >= '2026-01-01'
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);

    res.json({
      metrics: {
        total: stats.total || 0,
        active: stats.active || 0,
        expiringSoon: expiringSoonCount || 0,
        renewed: stats.renewed || 0,
        expired: stats.expired || 0,
        pending: stats.pending || 0
      },
      upcomingRenewals,
      recentActivities,
      statusDistribution,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats.' });
  }
};

// 7. Get Reports Data
const getReportsData = async (req, res) => {
  try {
    // Relationship Manager Performance
    const rmPerformance = await dbAll(`
      SELECT 
        relationship_manager as name,
        COUNT(*) as contracts_count,
        SUM(contract_value) as total_value,
        AVG(price_revision) as avg_price_revision,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired_count,
        SUM(CASE WHEN status = 'Renewed' THEN 1 ELSE 0 END) as renewed_count
      FROM contracts
      GROUP BY relationship_manager
    `);

    // Equipment Category Analysis
    const categoryAnalysis = await dbAll(`
      SELECT 
        equipment_category as name,
        COUNT(*) as count,
        SUM(contract_value) as total_value,
        AVG(contract_value) as avg_value
      FROM contracts
      GROUP BY equipment_category
    `);

    // Revenue Analysis (Sum values of active & renewed contracts)
    const revenueAnalysis = await dbGet(`
      SELECT 
        SUM(contract_value) as total_revenue,
        SUM(CASE WHEN status = 'Active' THEN contract_value ELSE 0 END) as active_revenue,
        SUM(CASE WHEN status = 'Renewed' THEN contract_value ELSE 0 END) as renewed_revenue,
        SUM(CASE WHEN status = 'Pending' THEN contract_value ELSE 0 END) as pending_revenue
      FROM contracts
    `);

    // Renewal Rates (renewed vs expired that reached end date)
    const renewalRateData = await dbGet(`
      SELECT 
        SUM(CASE WHEN status = 'Renewed' THEN 1 ELSE 0 END) as renewed,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired
      FROM contracts
    `);

    res.json({
      rmPerformance,
      categoryAnalysis,
      revenue: {
        total: revenueAnalysis.total_revenue || 0,
        active: revenueAnalysis.active_revenue || 0,
        renewed: revenueAnalysis.renewed_revenue || 0,
        pending: revenueAnalysis.pending_revenue || 0
      },
      renewalRate: {
        renewed: renewalRateData.renewed || 0,
        expired: renewalRateData.expired || 0
      }
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    res.status(500).json({ message: 'Error fetching reports analysis data.' });
  }
};

module.exports = {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getDashboardStats,
  getReportsData
};
