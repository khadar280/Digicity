const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  service: { type: String, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);
