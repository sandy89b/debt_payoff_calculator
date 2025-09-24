const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const UserController = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', UserController.me);
router.put('/profile', UserController.updateProfile);
router.put('/password', UserController.changePassword);

// Two-Factor Auth (TOTP)
router.post('/2fa/setup', UserController.twoFactorSetup);
router.post('/2fa/enable', UserController.twoFactorEnable);
router.post('/2fa/disable', UserController.twoFactorDisable);

module.exports = router;


