import Image from "next/image";
import type { TopRestaurant } from "@/lib/api/admin/dashboard";
import { getRestaurantImage } from "@/lib/restaurant-image";
import styles from "../../admin.module.css";

export default function TopRestaurantsCard({ data }: { data: TopRestaurant[] }) {
  return (
    <article className={styles.analyticsCard}>
      <header><h3>Most Booked Restaurants</h3><p>Top five by total reservations</p></header>
      {data.length === 0 ? <div className={styles.analyticsEmpty}>No restaurant bookings yet.</div> : (
        <ol className={styles.topRestaurants}>
          {data.map((restaurant) => (
            <li key={restaurant.restaurantId}>
              <Image src={getRestaurantImage(restaurant.image)} alt="" width={46} height={46} />
              <div><strong>{restaurant.name}</strong><span>{restaurant.cuisine}</span></div>
              <b>{restaurant.bookingCount}<small> bookings</small></b>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
