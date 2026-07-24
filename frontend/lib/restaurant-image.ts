import { API_URL } from "@/lib/api/config";
export const RESTAURANT_FALLBACK_IMAGE = "/images/Register.jpg";

export function getRestaurantImage(imagePath?: string) {
  const image = imagePath?.trim();
  if (!image) return RESTAURANT_FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:") || image.startsWith("blob:")) return image;
  if (image.startsWith("/images/")) return image;
  return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
}
