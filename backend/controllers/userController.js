const { pool } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
let speakeasy, QRCode;
try { speakeasy = require('speakeasy'); } catch (_) { speakeasy = null; }
try { QRCode = require('qrcode'); } catch (_) { QRCode = null; }

const ensureUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

class UserController {
  static async me(req, res) {
    try {
      const user = await ensureUser(req.user.id);
      // Include 2FA flags
      const row = await pool.query(`SELECT two_factor_enabled FROM users WHERE id=$1`, [user.id]);
      const json = user.toJSON();
      json.twoFactorEnabled = row.rows[0]?.two_factor_enabled || false;
      return res.json({ success: true, data: json });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone } = req.body;
      await ensureUser(userId);
      const result = await pool.query(
        `UPDATE users SET first_name=$1, last_name=$2, phone=$3, updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *`,
        [firstName, lastName, phone || null, userId]
      );
      return res.json({ success: true, data: new User(result.rows[0]).toJSON() });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      const user = await ensureUser(userId);
      // Allow setting first password for OAuth accounts (no current required)
      if (user.passwordHash) {
        const ok = await user.verifyPassword(currentPassword);
        if (!ok) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
      }
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      await pool.query(`UPDATE users SET password_hash=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`, [passwordHash, userId]);
      return res.json({ success: true, message: 'Password updated' });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async twoFactorSetup(req, res) {
    try {
      if (!speakeasy) {
        return res.status(500).json({ success: false, message: '2FA library not installed on server' });
      }
      const userId = req.user.id;
      const user = await ensureUser(userId);
      const secret = speakeasy.generateSecret({ name: `Legacy Mindset Solutions (${user.email})` });
      // Temporarily store pending secret in DB until verified
      await pool.query(`UPDATE users SET two_factor_temp_secret = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [secret.base32, userId]);
      let qrDataUrl = null;
      if (QRCode && secret.otpauth_url) {
        try { qrDataUrl = await QRCode.toDataURL(secret.otpauth_url); } catch (_) {}
      }
      return res.json({ success: true, data: { base32: secret.base32, otpauth: secret.otpauth_url, qrDataUrl } });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async twoFactorEnable(req, res) {
    try {
      if (!speakeasy) {
        return res.status(500).json({ success: false, message: '2FA library not installed on server' });
      }
      const userId = req.user.id;
      const { token } = req.body; // 6-digit code
      const row = await pool.query(`SELECT two_factor_temp_secret FROM users WHERE id=$1`, [userId]);
      const tempSecret = row.rows[0]?.two_factor_temp_secret;
      if (!tempSecret) {
        return res.status(400).json({ success: false, message: 'No 2FA setup in progress' });
      }
      const verified = speakeasy.totp.verify({ secret: tempSecret, encoding: 'base32', token, window: 1 });
      if (!verified) {
        return res.status(400).json({ success: false, message: 'Invalid verification code' });
      }
      await pool.query(`UPDATE users SET two_factor_secret=$1, two_factor_enabled=true, two_factor_temp_secret=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=$2`, [tempSecret, userId]);
      return res.json({ success: true, message: 'Two-factor enabled' });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async twoFactorDisable(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body || {};
      const user = await ensureUser(userId);
      if (!user.passwordHash) {
        return res.status(400).json({ success: false, message: 'Password not set for this account. Set a password first to disable 2FA.' });
      }
      if (!password || !(await user.verifyPassword(password))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      await pool.query(`UPDATE users SET two_factor_enabled=false, two_factor_secret=NULL, two_factor_temp_secret=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=$1`, [userId]);
      return res.json({ success: true, message: 'Two-factor disabled' });
    } catch (error) {
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = UserController;


