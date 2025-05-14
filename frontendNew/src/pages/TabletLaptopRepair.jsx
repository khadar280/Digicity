import React, { useState } from "react";
import "./TabletLaptopRepair.css";
import tabletImg from "../assets/taplet1.png"; // تصویر مناسب تبلت/لپ‌تاپ

const TabletLaptopRepair = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", model: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks! We'll contact you shortly.");
    // Reset form (یا ارسال به سرور در آینده)
    setFormData({ name: "", phone: "", model: "" });
  };

  return (
    <div className="tablet-repair-container">
      <div className="tablet-repair-box">
        <img src={tabletImg} alt="Tablet & Laptop Repair" className="tablet-img" />
        <h2>Tablet & Laptop Repair</h2>
        <p className="desc">
          For tablet and laptop issues, we recommend bringing the device to our store
          or contacting us directly so we can inspect and give you a quote.
        </p>

        <form className="tablet-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="email"
            placeholder="Email"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="model"
            placeholder="Device Model (optional)"
            value={formData.model}
            onChange={handleChange}
          />
          <button type="submit">Contact Me</button>
        </form>
      </div>
    </div>
  );
};

export default TabletLaptopRepair;


