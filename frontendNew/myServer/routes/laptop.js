const express = require('express');
const router = express.Router();
const Laptop = require('../models/laptop');
const nodemailer = require('nodemailer');

// Setup nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
router.post('/', async (req, res) => {
  const { name, phone, email, model } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required.' });
  }

  try {
    // Save to MongoDB
    const newRepairRequest = new Laptop({ name, phone, email, model });
    await newRepairRequest.save();

    // ✅ 1. Notify admin
    await transporter.sendMail({
      from: `"Laptop Repair" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '🛠️ New Laptop/Tablet Repair Request',
      html: `
        <h2>New Repair Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Device Model:</strong> ${model || 'Not provided'}</p>
        <p>📅 Time: ${new Date().toLocaleString()}</p>
      `,
    });

    // ✅ 2. Send confirmation to customer
    await transporter.sendMail({
      from: `"Digicity Repair" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ We received your repair request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center;">
            <img src="cid:digicitylogo" alt="Digicity Logo" style="height: 80px; margin-bottom: 10px;" />
          </div>
          <h2 style="color: #00aaff;">Hi ${name},</h2>
          <p>Thanks for reaching out to Digicity!</p>
          <p>We’ve received your request for tablet/laptop repair and will contact you shortly.</p>
          <p><strong>Your details:</strong></p>
          <ul>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Device Model:</strong> ${model || 'Not provided'}</li>
          </ul>
          <br />
          <p>Best regards,<br />Digicity Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.jpg',
          path: __dirname + '/logo.jpg', // ✅ Adjust path as needed
          cid: 'digicitylogo', // Match this with the img src cid
        }
      ]
    });
    

    res.status(200).json({
      message: "Thanks! We'll contact you shortly regarding your repair request.",
    });
  } catch (error) {
    console.error('Error processing repair request:', error);
    res.status(500).json({ error: 'Failed to process the repair request' });
  }
});


module.exports = router