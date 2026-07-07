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
  rating: { type: Number, default: 5.0 },
  priceRange: { type: String, enum: ["$", "$$", "$$$", "$$$$"], default: "Rs." },
  image: { type: String, default: "/images/Register.jpg" },
  isOpen: { type: Boolean, default: true },
  description: { type: String, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  hours: { type: String, default: "Mon-Sun: 11:00 AM - 10:00 PM" },
  features: [{ type: String }],
  tables: [tableSchema]
}, { timestamps: true });

module.exports = mongoose.models.Restaurant 
|| mongoose.model("Restaurant", restaurantSchema);
