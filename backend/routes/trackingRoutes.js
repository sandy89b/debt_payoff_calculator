const express = require('express');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Email Open Tracking Endpoint
 * GET /api/tracking/open/:trackingId
 * 
 * This endpoint is called when the tracking pixel in an email is loaded
 * It records the email open event and returns a 1x1 transparent pixel
 */
router.get('/open/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    
    // Decode the tracking ID (format: emailSendId-timestamp)
    const [emailSendId] = trackingId.split('-');
    
    if (!emailSendId || isNaN(emailSendId)) {
      logger.warn('Invalid tracking ID format', { trackingId });
      return sendTrackingPixel(res);
    }

    // Check if this email send exists
    const emailSendQuery = 'SELECT * FROM email_sends WHERE id = $1';
    const emailSendResult = await pool.query(emailSendQuery, [emailSendId]);
    
    if (emailSendResult.rows.length === 0) {
      logger.warn('Email send not found for tracking', { emailSendId, trackingId });
      return sendTrackingPixel(res);
    }

    const emailSend = emailSendResult.rows[0];

    // Check if this is the first open (to avoid counting multiple opens from the same email)
    const existingOpenQuery = 'SELECT id FROM email_opens WHERE email_send_id = $1';
    const existingOpenResult = await pool.query(existingOpenQuery, [emailSendId]);
    
    const isFirstOpen = existingOpenResult.rows.length === 0;

    // Record the email open
    const insertOpenQuery = `
      INSERT INTO email_opens (email_send_id, user_id, campaign_id, template_id, opened_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, NOW(), $5, $6)
      ON CONFLICT (email_send_id) DO UPDATE SET
        opened_at = NOW(),
        ip_address = EXCLUDED.ip_address,
        user_agent = EXCLUDED.user_agent
      RETURNING id
    `;
    
    await pool.query(insertOpenQuery, [
      emailSendId,
      emailSend.user_id,
      emailSend.campaign_id,
      emailSend.template_id,
      ipAddress,
      userAgent
    ]);

    // Update email_sends table to mark as opened (increment open_count)
    const updateEmailSendQuery = `
      UPDATE email_sends 
      SET 
        status = CASE WHEN status = 'sent' THEN 'opened' ELSE status END,
        open_count = COALESCE(open_count, 0) + 1,
        first_opened_at = CASE WHEN first_opened_at IS NULL THEN NOW() ELSE first_opened_at END,
        last_opened_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(updateEmailSendQuery, [emailSendId]);

    // Log the open event
    if (isFirstOpen) {
      logger.info('Email opened (first time)', { 
        emailSendId, 
        userId: emailSend.user_id, 
        campaignId: emailSend.campaign_id,
        email: emailSend.recipient_email,
        trackingId 
      });
    } else {
      logger.info('Email opened (repeat)', { 
        emailSendId, 
        userId: emailSend.user_id, 
        email: emailSend.recipient_email,
        trackingId 
      });
    }

    // Return the tracking pixel
    return sendTrackingPixel(res);

  } catch (error) {
    logger.error('Error tracking email open', { error: error.message, trackingId: req.params.trackingId });
    return sendTrackingPixel(res);
  }
});

/**
 * Send a 1x1 transparent pixel image
 */
function sendTrackingPixel(res) {
  // 1x1 transparent GIF in base64
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.end(pixel);
}

module.exports = router;
