const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/create-checkout-session', async (req, res) => {
  const { items, total, customer, deliveryMethod, address, city, postcode, country } = req.body;

  const lineItems = items.map((item) => {
    const unitAmount = Math.round(Number(item.price) * 100);

    if (isNaN(unitAmount)) {
      throw new Error(`Invalid unit_amount for item: ${item.name}`);
    }

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  });

  try {
   const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'klarna', 'sepa_debit', 'mobilepay'], 
  mode: 'payment',
  line_items: lineItems,
  customer_email: customer?.email,
  success_url: 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'http://localhost:3001/cancel',
  locale: 'fi',
});


    // Email content with order details
    const emailContent = `
      <h2>New Order Created</h2>
      <p><strong>Customer Name:</strong> ${customer?.name}</p>
      <p><strong>Email:</strong> ${customer?.email}</p>
      <p><strong>Delivery Method:</strong> ${deliveryMethod || "Not provided"}</p>
      <p><strong>Address:</strong> ${address || "N/A"}</p>
      <p><strong>City:</strong> ${city || "N/A"}</p>
      <p><strong>Postcode:</strong> ${postcode || "N/A"}</p>
      <p><strong>Country:</strong> ${country || "N/A"}</p>
      <p><strong>Total Amount:</strong> €${total}</p>
      <h3>Items:</h3>
      <ul>
        ${items.map(item => `<li>${item.name} - €${item.price} x ${item.quantity}</li>`).join('')}
      </ul>
      <p>Click <a href="${session.url}">here</a> to proceed with the payment.</p>
    `;

    // Send order confirmation email to admin
    await transporter.sendMail({
      from: `"New Order" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Order Received",
      html: emailContent,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
