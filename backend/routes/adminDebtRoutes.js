const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

// Apply admin authentication to all routes
router.use(verifyAdmin);

// Get all debts from all users (Admin only)
router.get('/all-debts', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.user_id,
        u.email,
        u.first_name,
        u.last_name,
        d.name as debt_name,
        d.balance,
        d.interest_rate,
        d.minimum_payment,
        d.due_date,
        d.debt_type,
        d.description,
        d.original_balance,
        d.is_active,
        d.paid_off_date,
        d.created_at,
        d.updated_at,
        CASE 
          WHEN d.is_active = true THEN 'Active'
          WHEN d.paid_off_date IS NOT NULL THEN 'Paid Off'
          ELSE 'Inactive'
        END as status
      FROM debts d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `;

    const result = await pool.query(query);
    
    const debtsWithUserInfo = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userEmail: row.email,
      userName: row.first_name && row.last_name 
        ? `${row.first_name} ${row.last_name}` 
        : row.email.split('@')[0],
      debtName: row.debt_name,
      balance: parseFloat(row.balance),
      interestRate: parseFloat(row.interest_rate) * 100, // Convert to percentage
      minimumPayment: parseFloat(row.minimum_payment),
      dueDate: row.due_date,
      debtType: row.debt_type,
      description: row.description,
      originalBalance: parseFloat(row.original_balance || row.balance),
      isActive: row.is_active,
      status: row.status,
      paidOffDate: row.paid_off_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: debtsWithUserInfo,
      total: debtsWithUserInfo.length,
      summary: {
        totalUsers: [...new Set(debtsWithUserInfo.map(d => d.userId))].length,
        totalDebts: debtsWithUserInfo.length,
        activeDebts: debtsWithUserInfo.filter(d => d.isActive).length,
        paidOffDebts: debtsWithUserInfo.filter(d => d.status === 'Paid Off').length,
        totalBalance: debtsWithUserInfo
          .filter(d => d.isActive)
          .reduce((sum, d) => sum + d.balance, 0)
      }
    });

  } catch (error) {
    logger.error('Error fetching all debts for admin', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debts',
      error: error.message
    });
  }
});

// Get debts by specific user (Admin only)
router.get('/user/:userId/debts', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        d.*,
        u.email,
        u.first_name,
        u.last_name
      FROM debts d
      JOIN users u ON d.user_id = u.id
      WHERE d.user_id = $1
      ORDER BY d.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        userInfo: null,
        message: 'No debts found for this user'
      });
    }

    const userInfo = {
      id: result.rows[0].user_id,
      email: result.rows[0].email,
      name: result.rows[0].first_name && result.rows[0].last_name 
        ? `${result.rows[0].first_name} ${result.rows[0].last_name}` 
        : result.rows[0].email.split('@')[0]
    };

    const debts = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      balance: parseFloat(row.balance),
      interestRate: parseFloat(row.interest_rate) * 100,
      minimumPayment: parseFloat(row.minimum_payment),
      dueDate: row.due_date,
      debtType: row.debt_type,
      description: row.description,
      originalBalance: parseFloat(row.original_balance || row.balance),
      isActive: row.is_active,
      paidOffDate: row.paid_off_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: debts,
      userInfo,
      summary: {
        totalDebts: debts.length,
        activeDebts: debts.filter(d => d.isActive).length,
        totalBalance: debts.filter(d => d.isActive).reduce((sum, d) => sum + d.balance, 0)
      }
    });

  } catch (error) {
    logger.error('Error fetching user debts for admin', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user debts',
      error: error.message
    });
  }
});

// Get all users with debt summary (Admin only)
router.get('/users-with-debts', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.created_at as user_created_at,
        COUNT(d.id) as total_debts,
        COUNT(CASE WHEN d.is_active = true THEN 1 END) as active_debts,
        COUNT(CASE WHEN d.paid_off_date IS NOT NULL THEN 1 END) as paid_debts,
        COALESCE(SUM(CASE WHEN d.is_active = true THEN d.balance END), 0) as total_balance,
        COALESCE(SUM(CASE WHEN d.is_active = true THEN d.minimum_payment END), 0) as total_min_payments
      FROM users u
      LEFT JOIN debts d ON u.id = d.user_id
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.created_at
      HAVING COUNT(d.id) > 0
      ORDER BY total_balance DESC
    `;

    const result = await pool.query(query);
    
    const usersWithDebts = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.first_name && row.last_name 
        ? `${row.first_name} ${row.last_name}` 
        : row.email.split('@')[0],
      userCreatedAt: row.user_created_at,
      totalDebts: parseInt(row.total_debts),
      activeDebts: parseInt(row.active_debts),
      paidDebts: parseInt(row.paid_debts),
      totalBalance: parseFloat(row.total_balance),
      totalMinPayments: parseFloat(row.total_min_payments),
      debtFreeProgress: row.total_debts > 0 
        ? Math.round((parseInt(row.paid_debts) / parseInt(row.total_debts)) * 100)
        : 0
    }));

    res.json({
      success: true,
      data: usersWithDebts,
      summary: {
        totalUsers: usersWithDebts.length,
        totalActiveDebts: usersWithDebts.reduce((sum, u) => sum + u.activeDebts, 0),
        totalDebtAmount: usersWithDebts.reduce((sum, u) => sum + u.totalBalance, 0),
        averageDebtsPerUser: usersWithDebts.length > 0 
          ? Math.round(usersWithDebts.reduce((sum, u) => sum + u.totalDebts, 0) / usersWithDebts.length)
          : 0
      }
    });

  } catch (error) {
    logger.error('Error fetching users with debts summary', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users with debts',
      error: error.message
    });
  }
});

module.exports = router;
