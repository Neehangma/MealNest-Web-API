const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  capacity: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  cuisine: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  priceRange: { type: String, trim: true, default: "$$" },
  price: { type: Number, min: 150, max: 500 },
  image: { type: String, default: "/images/Register.jpg" },
  isActive: { type: Boolean, default: true },
  isOpen: { type: Boolean, default: true },
  description: { type: String, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  hours: { type: String, default: "Mon-Sun: 11:00 AM - 10:00 PM" },
  featured: { type: Boolean, default: false },
  availableTimeSlots: [{ type: String }],
  features: [{ type: String }],
  tables: [tableSchema]
}, { timestamps: true });

module.exports = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
