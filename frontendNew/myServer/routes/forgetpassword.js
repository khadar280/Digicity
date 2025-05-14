    const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '15m', // Token expires in 15 minutes
    });


    const resetLink = `http://localhost:5173/reset-password/${token}`;
    

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `To reset your password, click the link below:\n\n${resetLink}`,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('[Forgot Password] Error:', err.message || err);
    res.status(500).json({ error: 'Error sending reset link.' });
  }
});

module.exports = router;
