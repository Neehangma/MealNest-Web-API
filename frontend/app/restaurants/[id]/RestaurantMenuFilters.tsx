"use client";

export type MenuFilter = {
  id: string;
  label: string;
};

type RestaurantMenuFiltersProps = {
  filters: MenuFilter[];
  selectedFilter: string;
  onSelect: (filterId: string) => void;
};

export default function RestaurantMenuFilters({ filters, selectedFilter, onSelect }: RestaurantMenuFiltersProps) {
  return (
    <div className="menu-filter-list" role="group" aria-label="Filter menu by category">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onSelect(filter.id)}
          className={`menu-filter-button ${selectedFilter === filter.id ? "active" : ""}`}
          aria-pressed={selectedFilter === filter.id}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
