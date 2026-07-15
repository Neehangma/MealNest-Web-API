const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";
export const RESTAURANT_FALLBACK_IMAGE = "/images/Register.jpg";

export function getRestaurantImage(imagePath?: string) {
  if (!imagePath) return RESTAURANT_FALLBACK_IMAGE;
  if (imagePath.startsWith("http") || imagePath.startsWith("data:") || imagePath.startsWith("blob:")) return imagePath;
  if (imagePath.startsWith("/uploads/")) return `${API_BASE_URL}${imagePath}`;
  return imagePath;
}
