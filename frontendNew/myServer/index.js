require('dotenv').config(); // Ensure environment variables are loaded first
console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY ? "✅ loaded" : "❌ missing");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');  
// Import routes
const contactRoutes = require('./routes/contact');
const orderRoutes = require('./routes/order');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const checkoutRoutes = require('./routes/checkout');
const authRoutes = require('./routes/auth');
const searchbarRoutes = require('./routes/searchbar');
const laptopRoutes = require('./routes/laptop');
const passwordResetRoutes = require('./routes/passwordReset');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

app.use('/api/contact', contactRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/booking', bookingRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/searchbar', searchbarRoutes);
app.use("/api/laptop", laptopRoutes);
app.use('/api/auth', passwordResetRoutes);

// 404 Handler (for routes not found)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found!' });
});


app.use((err, req, res, next) => {
  console.error(err);  // Log error to the server console
  res.status(500).json({ error: 'Something went wrong!' });  // Respond with 500
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Start the server
app.listen(port, () => {
  console.log(`🚀 mercy is running at http://localhost:${port}`);
});
