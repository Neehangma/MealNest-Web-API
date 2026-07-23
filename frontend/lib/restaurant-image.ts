const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8088";
export const RESTAURANT_FALLBACK_IMAGE = "/images/Register.jpg";

export function getRestaurantImage(imagePath?: string) {
  const image = imagePath?.trim();
  if (!image) return RESTAURANT_FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:") || image.startsWith("blob:")) return image;
  if (image.startsWith("/images/")) return image;
  return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}
