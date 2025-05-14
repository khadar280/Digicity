const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '15m',
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `Reset your password using this link: ${resetLink}`,
    });

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (err) {
    res.status(500).json({ error: 'Error sending reset link' });
  }
});
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'Invalid token' });

    user.password = password; // auto-hashed in mongoose pre-save
    await user.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});


module.exports = router;
