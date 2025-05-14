const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { customerName, customerEmail, bookingDate, service, lang } = req.body;

  if (!customerName || !customerEmail || !bookingDate || !service) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Save booking to MongoDB
    const newBooking = new Booking({
      customerName,
      customerEmail,
      bookingDate,
      service,
    });

    await newBooking.save();
 const isFi = lang?.startsWith('fi');
    const localized = {
      subject: isFi ? '✅ Vahvistus: Ajanvarauksesi Digicityyn' : '✅ Your Booking with Digicity is Confirmed',
      greeting: isFi
        ? `Kiitos varauksestasi, ${customerName}!`
        : `Thank you for your booking, ${customerName}!`,
      intro: isFi
        ? 'Varaus Digicityyn on vahvistettu onnistuneesti.'
        : 'Your booking with Digicity has been successfully confirmed.',
      serviceLabel: isFi ? 'Palvelu' : 'Service',
      dateLabel: isFi ? 'Päivämäärä ja aika' : 'Date & Time',
      note: isFi
        ? 'Jos sinulla on kysyttävää, voit vastata tähän sähköpostiin. Nähdään pian!'
        : 'If you have any questions, just reply to this email. We look forward to serving you!',
      regards: isFi ? 'Terveisin, Digicity-tiimi' : 'Regards, Digicity Team',
    };

    // Admin notification email
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Booking Request",
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Booking Date:</strong> ${new Date(bookingDate).toLocaleString()}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p>📅 Submitted At: ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    // Customer confirmation email
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: localized.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center;">
            <img src="cid:digicitylogo" alt="Digicity Logo" style="height: 80px; margin-bottom: 10px;" />
            <h2 style="color: #00aaff;">${localized.greeting}</h2>
          </div>
          <p>${localized.intro}</p>
          <p><strong>${localized.serviceLabel}:</strong> ${service}</p>
          <p><strong>${localized.dateLabel}:</strong> ${new Date(bookingDate).toLocaleString()}</p>
          <br />
          <p>${localized.note}</p>
          <p>${localized.regards}</p>
        </div>
      `,
      attachments: [{
        filename: 'logo.jpg',
        path: __dirname + '/logo.jpg',
        cid: 'digicitylogo'
      }]
    };

    await transporter.sendMail(customerMailOptions);

    res.status(201).json({ message: 'Booking created and confirmation email sent!' });

  } catch (err) {
    console.error('❌ Failed to create booking or send email:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
