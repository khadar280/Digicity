const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Helper to safely generate token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY not set in environment');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
};


router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('[SIGNUP] Payload received:', { name, email });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('[SIGNUP] Email already in use:', email);
      return res.status(400).json({ error: 'Email already in use' });
    }

  
    const newUser = new User({ name, email, password });
    await newUser.save(); // Mongoose will hash automatically

    const token = generateToken(newUser._id);
    console.log('[SIGNUP] User created:', newUser._id);

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error('[SIGNUP] Error:', err.message || err);
    res.status(500).json({ error: 'Error signing up user' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  console.log('[SIGNIN] Attempting login for:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[SIGNIN] User not found:', email);
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('[SIGNIN] Invalid password for:', email);
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = generateToken(user._id);

    console.log('[SIGNIN] Successful login:', user._id);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[SIGNIN] Error:', err.message || err);
    res.status(500).json({ error: 'Error logging in user' });
  }
});

module.exports = router;
