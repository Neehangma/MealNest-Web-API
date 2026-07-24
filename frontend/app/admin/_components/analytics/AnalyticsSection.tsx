"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/lib/api/admin/dashboard";
import type { AdminAnalyticsResponse, AnalyticsRange } from "@/lib/api/admin/dashboard";
import AnalyticsRangeFilter from "./AnalyticsRangeFilter";
import BookingStatusChart from "./BookingStatusChart";
import BookingTrendsChart from "./BookingTrendsChart";
import CuisineDistributionChart from "./CuisineDistributionChart";
import TopRestaurantsCard from "./TopRestaurantsCard";
import UserGrowthChart from "./UserGrowthChart";
import styles from "../../admin.module.css";

const requestCache = new Map<AnalyticsRange, Promise<AdminAnalyticsResponse>>();

function loadAnalytics(range: AnalyticsRange, refresh = false) {
  if (refresh) requestCache.delete(range);
  const cached = requestCache.get(range);
  if (cached) return cached;

  const request = getAdminAnalytics(range).catch((error) => {
    requestCache.delete(range);
    throw error;
  });
  requestCache.set(range, request);
  return request;
}

function AnalyticsSkeleton() {
  return (
    <div className={styles.analyticsSkeletonGrid} aria-label="Loading analytics">
      {[1, 2, 3, 4, 5].map((item) => <div className={styles.analyticsSkeleton} key={item}><i /><span /><span /></div>)}
    </div>
  );
}

export default function AnalyticsSection() {
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function retry() {
    setLoading(true);
    setError("");
    try {
      setAnalytics(await loadAnalytics(range, true));
    } catch (reason) {
      setAnalytics(null);
      setError(reason instanceof Error ? reason.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    loadAnalytics(range)
      .then((result) => {
        if (active) setAnalytics(result);
      })
      .catch((reason) => {
        if (!active) return;
        setAnalytics(null);
        setError(reason instanceof Error ? reason.message : "Unable to load analytics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [range]);

  return (
    <section className={styles.analyticsSection} aria-labelledby="analytics-heading">
      <div className={styles.analyticsHeading}>
        <div><h2 id="analytics-heading">Analytics</h2><p>Live insights from MealNest activity.</p></div>
        <AnalyticsRangeFilter value={range} onChange={(nextRange) => {
          setRange(nextRange);
          setLoading(true);
          setError("");
        }} />
      </div>

      {loading && <AnalyticsSkeleton />}
      {!loading && error && (
        <div className={styles.analyticsError} role="alert">
          <div><strong>Analytics could not be loaded.</strong><span>{error}</span></div>
          <button type="button" onClick={() => void retry()}>Retry</button>
        </div>
      )}
      {!loading && analytics && (
        <div className={styles.analyticsGrid}>
          <BookingTrendsChart data={analytics.bookingTrends} />
          <BookingStatusChart data={analytics.bookingStatuses} />
          <CuisineDistributionChart data={analytics.restaurantsByCuisine} />
          <UserGrowthChart data={analytics.userGrowth} />
          <TopRestaurantsCard data={analytics.topRestaurants} />
        </div>
      )}
    </section>
  );
}
