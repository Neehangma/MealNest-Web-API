function text(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function createRestaurantDto(body) {
  return {
    name: text(body.name),
    cuisine: text(body.cuisine),
    location: text(body.location),
    description: text(body.description),
    image: text(body.image, "/images/Register.jpg"),
    rating: Number(body.rating ?? 5),
    reviewCount: Number(body.reviewCount ?? 0),
    priceRange: text(body.priceRange, "$$"),
    price: body.price === undefined || body.price === "" ? undefined : Number(body.price),
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    isOpen: body.isOpen !== undefined ? Boolean(body.isOpen) : true,
    address: text(body.address, body.location),
    phone: text(body.phone, "+977 1-0000000"),
    hours: text(body.hours, "Mon-Sun: 11:00 AM - 10:00 PM"),
    featured: body.featured !== undefined ? Boolean(body.featured) : false,
    availableTimeSlots: Array.isArray(body.availableTimeSlots) ? body.availableTimeSlots.map((slot) => text(slot)).filter(Boolean) : [],
    features: Array.isArray(body.features) ? body.features.map((feature) => text(feature)).filter(Boolean) : [],
  };
}

function createRestaurantUpdateDto(body) {
  const dto = {};
  const textFields = ["name", "cuisine", "location", "description", "image", "priceRange", "address", "phone", "hours"];
  for (const field of textFields) {
    if (body[field] !== undefined) dto[field] = text(body[field]);
  }
  if (body.rating !== undefined) dto.rating = Number(body.rating);
  if (body.reviewCount !== undefined) dto.reviewCount = Number(body.reviewCount);
  if (body.price !== undefined && body.price !== "") dto.price = Number(body.price);
  if (body.isActive !== undefined) dto.isActive = Boolean(body.isActive);
  if (body.isOpen !== undefined) dto.isOpen = Boolean(body.isOpen);
  if (body.featured !== undefined) dto.featured = Boolean(body.featured);
  if (Array.isArray(body.availableTimeSlots)) dto.availableTimeSlots = body.availableTimeSlots.map((slot) => text(slot)).filter(Boolean);
  if (Array.isArray(body.features)) dto.features = body.features.map((feature) => text(feature)).filter(Boolean);
  return dto;
}

module.exports = { createRestaurantDto, createRestaurantUpdateDto };
