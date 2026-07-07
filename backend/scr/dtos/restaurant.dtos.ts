interface RestaurantDto {
  name: string;
  cuisine: string;
  location: string;
  address: string;
  description: string;
  image: string;
  phoneNumber: string;
  email: string;
  openingTime: string;
  closingTime: string;
  averageCost: number;
  rating: number;
  totalTables: number;
  availableTables: number;
  isActive: boolean;
}

function createRestaurantDto(body: Partial<RestaurantDto>): RestaurantDto {
  return {
    name: String(body.name || "").trim(),
    cuisine: String(body.cuisine || "").trim(),
    location: String(body.location || "").trim(),
    address: String(body.address || "").trim(),
    description: String(body.description || "").trim(),
    image: String(body.image || "").trim(),
    phoneNumber: String(body.phoneNumber || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    openingTime: String(body.openingTime || "").trim(),
    closingTime: String(body.closingTime || "").trim(),
    averageCost: Number(body.averageCost || 0),
    rating: Number(body.rating || 5),
    totalTables: Number(body.totalTables || 10),
    availableTables: Number(body.availableTables || 10),
    isActive:
      body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function createRestaurantUpdateDto(body: Partial<RestaurantDto>): Partial<RestaurantDto> {
  const dto: Partial<RestaurantDto> = {};

  if (body.name !== undefined)
    dto.name = String(body.name || "").trim();

  if (body.cuisine !== undefined)
    dto.cuisine = String(body.cuisine || "").trim();

  if (body.location !== undefined)
    dto.location = String(body.location || "").trim();

  if (body.address !== undefined)
    dto.address = String(body.address || "").trim();

  if (body.description !== undefined)
    dto.description = String(body.description || "").trim();

  if (body.image !== undefined)
    dto.image = String(body.image || "").trim();

  if (body.phoneNumber !== undefined)
    dto.phoneNumber = String(body.phoneNumber || "").trim();

  if (body.email !== undefined)
    dto.email = String(body.email || "").trim().toLowerCase();

  if (body.openingTime !== undefined)
    dto.openingTime = String(body.openingTime || "").trim();

  if (body.closingTime !== undefined)
    dto.closingTime = String(body.closingTime || "").trim();

  if (body.averageCost !== undefined)
    dto.averageCost = Number(body.averageCost);

  if (body.rating !== undefined)
    dto.rating = Number(body.rating);

  if (body.totalTables !== undefined)
    dto.totalTables = Number(body.totalTables);

  if (body.availableTables !== undefined)
    dto.availableTables = Number(body.availableTables);

  if (body.isActive !== undefined)
    dto.isActive = Boolean(body.isActive);

  return dto;
}

module.exports = {
  createRestaurantDto,
  createRestaurantUpdateDto,
};