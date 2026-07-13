export function ReservationCardSkeleton() {
  return (
    <div className="dash-reservation-card is-skeleton">
      <div className="dash-skeleton dash-skeleton-media" />
      <div className="dash-reservation-info">
        <div className="dash-skeleton dash-skeleton-line w-60" />
        <div className="dash-skeleton dash-skeleton-line w-40" />
        <div className="dash-skeleton dash-skeleton-line w-80" />
        <div className="dash-skeleton dash-skeleton-line w-50" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="dash-card-skeleton">
      <div className="dash-skeleton dash-skeleton-media" />
      <div className="dash-card-skeleton-body">
        <div className="dash-skeleton dash-skeleton-line w-70" />
        <div className="dash-skeleton dash-skeleton-line w-40" />
        <div className="dash-skeleton dash-skeleton-line w-90" />
      </div>
    </div>
  );
}

export function HistoryRowSkeleton() {
  return (
    <div className="dash-history-row is-skeleton">
      <div className="dash-skeleton dash-skeleton-thumb" />
      <div className="dash-history-info">
        <div className="dash-skeleton dash-skeleton-line w-60" />
        <div className="dash-skeleton dash-skeleton-line w-40" />
      </div>
    </div>
  );
}
