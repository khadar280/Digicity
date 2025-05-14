import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import { useTranslation } from 'react-i18next';
import './CheckoutPage.css';

const DELIVERY_OPTIONS = {
  standard: { label: 'Standard Delivery (4.99€)', price: 4.99 },
  express: { label: 'Express Delivery (19.99€)', price: 19.99 },
  pickup: { label: 'Pickup from Shop (Free)', price: 0 },
};

const CheckoutPage = () => {
  const { cartItems } = useCart();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
    deliveryMethod: 'standard',
    paymentMethod: 'card'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const totalProductPrice = cartItems.reduce((total, item) => {
    const numeric = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return total + numeric;
  }, 0);

  const deliveryFee = DELIVERY_OPTIONS[form.deliveryMethod]?.price || 0;
  const totalPrice = totalProductPrice + deliveryFee;
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    items: cartItems.map(item => ({
      name: item.name,
      price: parseFloat(item.price.replace(/[^0-9.]/g, '')), // remove € signs etc.
      quantity: item.quantity || 1,
    })),
    total: totalPrice,
    customer: {
      name: form.name,
      email: form.email,
      phone: form.phone,
    },
    deliveryMethod: form.deliveryMethod,
    address: form.address,
    city: form.city,
    postcode: form.postcode,
    country: form.country,
  };

  try {
    const response = await fetch("http://localhost:3000/api/payment/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to create checkout session.");
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    alert("An error occurred while processing your payment.");
  }
};


  return (
    <div className="checkout-container">
      <h2>{t("checkout.title", "Checkout")}</h2>

      <div className="checkout-content">
        <div className="checkout-summary">
          <h4>{t("checkout.summary", "Order Summary")}</h4>
          {cartItems.map((item, i) => (
            <div key={i} className="checkout-item">
              <span>{item.name}</span>
              <span>{item.price}</span>
            </div>
          ))}
          <hr />
          <p>Delivery: <strong>{DELIVERY_OPTIONS[form.deliveryMethod].label}</strong></p>
          <p className="total">Total: <strong>{totalPrice.toFixed(2)} €</strong></p>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h4>{t("checkout.billingInfo", "Billing Info")}</h4>
          <input type="text" name="name" placeholder={t("bookingForm.name", "Full Name")} value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder={t("bookingForm.email", "Email")} value={form.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder={t("bookingForm.phone", "Phone Number")} value={form.phone} onChange={handleChange} required />

          <textarea name="address" placeholder={t("bookingForm.address", "Street Address")} value={form.address} onChange={handleChange} required />
          <input type="text" name="city" placeholder={t("bookingForm.city", "City")} value={form.city} onChange={handleChange} required />
          <input type="text" name="postcode" placeholder={t("bookingForm.postcode", "Postcode")} value={form.postcode} onChange={handleChange} required />
          <input type="text" name="country" placeholder={t("bookingForm.country", "Country")} value={form.country} onChange={handleChange} required />

          <h4>{t("checkout.deliveryMethod", "Delivery Method")}</h4>
          <div className="delivery-options">
            {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
              <label
                key={key}
                className={`delivery-button ${form.deliveryMethod === key ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={key}
                  checked={form.deliveryMethod === key}
                  onChange={handleChange}
                />
                {option.label}
              </label>
            ))}
          </div>

          

          <button type="submit">{t("checkout.placeOrder", "Place Order")}</button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
