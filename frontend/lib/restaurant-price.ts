const PRICE_OPTIONS = [150, 180, 200, 220, 250, 275, 300, 325, 350, 375, 400, 420, 450, 475, 500];

export function getStableRestaurantPrice(restaurant: {
  _id?: string;
  id?: string;
  name?: string;
  price?: number | string;
}) {
  const numericPrice = Number(restaurant.price);
  if (Number.isFinite(numericPrice) && numericPrice >= 150 && numericPrice <= 500) return numericPrice;
  const key = String(restaurant._id || restaurant.id || restaurant.name || "");
  const hash = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return PRICE_OPTIONS[hash % PRICE_OPTIONS.length];
}
