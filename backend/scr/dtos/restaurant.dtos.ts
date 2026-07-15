function text(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function booleanValue(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === "string") return value === "true";
  return Boolean(value);
}

function listValue(value) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => text(item)).filter(Boolean);
  } catch {}
  return text(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function createRestaurantDto(body) {
  return {
    name: text(body.name),
    cuisine: text(body.cuisine),
    location: text(body.location),
    description: text(body.description),
    image: text(body.image, "/images/Register.jpg"),
    priceRange: text(body.priceRange, "$$"),
    price: body.price === undefined || body.price === "" ? undefined : Number(body.price),
    isActive: booleanValue(body.isActive, true),
    isOpen: booleanValue(body.isOpen, true),
    address: text(body.address, body.location),
    phone: text(body.phone, "+977 1-0000000"),
    hours: text(body.hours, "Mon-Sun: 11:00 AM - 10:00 PM"),
    featured: booleanValue(body.featured, false),
    availableTimeSlots: listValue(body.availableTimeSlots),
    features: listValue(body.features || body.menuFeatures),
  };
}

function createRestaurantUpdateDto(body) {
  const dto = {};
  const textFields = ["name", "cuisine", "location", "description", "image", "priceRange", "address", "phone", "hours"];
  for (const field of textFields) {
    if (body[field] !== undefined) dto[field] = text(body[field]);
  }
  if (body.price !== undefined && body.price !== "") dto.price = Number(body.price);
  if (body.isActive !== undefined) dto.isActive = booleanValue(body.isActive, true);
  if (body.isOpen !== undefined) dto.isOpen = booleanValue(body.isOpen, true);
  if (body.featured !== undefined) dto.featured = booleanValue(body.featured, false);
  if (body.availableTimeSlots !== undefined) dto.availableTimeSlots = listValue(body.availableTimeSlots);
  if (body.features !== undefined || body.menuFeatures !== undefined) dto.features = listValue(body.features || body.menuFeatures);
  return dto;
}

module.exports = { createRestaurantDto, createRestaurantUpdateDto };
