"use client";

import { useState } from "react";
import { getCuisineMenu, type CuisineMenu, type MenuItem } from "@/lib/cuisine-menus";
import RestaurantMenuFilters from "./RestaurantMenuFilters";

type RestaurantMenuProps = {
  cuisine?: string;
  menuOverride?: CuisineMenu;
};

const categoryId = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-").replace(/[^a-z-]/g, "");

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <article className="restaurant-menu-item">
      <div className="restaurant-menu-item-copy">
        <div className="restaurant-menu-item-heading">
          <h3>{item.name}</h3>
          <strong>Rs. {item.price.toLocaleString("en-NP")}</strong>
        </div>
        <p>{item.description}</p>
        <div className="restaurant-menu-item-meta">
          <span className="restaurant-menu-category-label">{item.category}</span>
          {item.vegetarian && <span className="restaurant-menu-badge vegetarian">Vegetarian</span>}
          {item.spicy && <span className="restaurant-menu-badge spicy">Spicy</span>}
        </div>
      </div>
    </article>
  );
}

export default function RestaurantMenu({ cuisine, menuOverride }: RestaurantMenuProps) {
  const menu = getCuisineMenu(cuisine, menuOverride);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const availableCategories = menu?.categories.filter((category) => category.items.length > 0) || [];
  const filters = [
    { id: "all", label: "All" },
    ...availableCategories.map((category) => ({
      id: categoryId(category.name),
      label: category.name,
    })),
  ];
  const visibleItems = availableCategories
    .filter((category) => selectedFilter === "all" || categoryId(category.name) === selectedFilter)
    .flatMap((category) => category.items) || [];

  return (
    <section className="restaurant-menu-section" aria-labelledby="restaurant-menu-title">
      <div className="restaurant-menu-header">
        <div>
          <h2 id="restaurant-menu-title">Restaurant Menu</h2>
          {menu && <p>Explore a selection of {menu.cuisine} favorites.</p>}
        </div>
      </div>

      {!menu ? (
        <p className="restaurant-menu-unavailable">Menu information is currently unavailable for this restaurant.</p>
      ) : (
        <>
          <RestaurantMenuFilters filters={filters} selectedFilter={selectedFilter} onSelect={setSelectedFilter} />
          <div className="restaurant-menu-grid">
            {visibleItems.map((item) => <MenuItemCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </section>
  );
}
