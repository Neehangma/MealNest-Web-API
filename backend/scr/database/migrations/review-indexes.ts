const Review = require("../../models/review.model");

const RESERVATION_INDEX_NAME = "reservationId_1";
const LEGACY_RESTAURANT_USER_INDEX_NAME = "restaurantId_1_userId_1";

function isDesiredReservationIndex(index) {
  return (
    index.name === RESERVATION_INDEX_NAME &&
    index.key?.reservationId === 1 &&
    index.unique === true &&
    index.sparse === true
  );
}

async function assertNoDuplicateReservationIds() {
  const duplicates = await Review.collection
    .aggregate([
      { $match: { reservationId: { $exists: true, $ne: null } } },
      { $group: { _id: "$reservationId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ])
    .toArray();

  if (duplicates.length > 0) {
    throw new Error(
      "Cannot create unique reservationId_1 index: duplicate reservationId values exist",
    );
  }
}

async function migrateReviewIndexes() {
  let indexes = [];
  try {
    indexes = await Review.collection.indexes();
  } catch (error) {
    // A fresh database has no reviews collection yet.
    if (error?.code !== 26 && error?.codeName !== "NamespaceNotFound") {
      throw error;
    }
  }
  const reservationIndex = indexes.find(
    (index) => index.name === RESERVATION_INDEX_NAME,
  );

  if (reservationIndex && !isDesiredReservationIndex(reservationIndex)) {
    await assertNoDuplicateReservationIds();
    await Review.collection.dropIndex(RESERVATION_INDEX_NAME);
  }

  const legacyIndex = indexes.find(
    (index) =>
      index.name === LEGACY_RESTAURANT_USER_INDEX_NAME && index.unique === true,
  );
  if (legacyIndex) {
    await Review.collection.dropIndex(LEGACY_RESTAURANT_USER_INDEX_NAME);
  }

  await Review.collection.createIndex(
    { reservationId: 1 },
    { name: RESERVATION_INDEX_NAME, unique: true, sparse: true },
  );

  // Create the remaining non-conflicting indexes declared by reviewSchema.
  await Review.createIndexes();
}

module.exports = {
  migrateReviewIndexes,
};
