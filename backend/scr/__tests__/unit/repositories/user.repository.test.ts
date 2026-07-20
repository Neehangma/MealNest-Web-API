const userModel = {
  findOne: jest.fn(), findById: jest.fn(), create: jest.fn(), find: jest.fn(),
  countDocuments: jest.fn(), findByIdAndDelete: jest.fn(),
};
const restaurantModel = {
  countDocuments: jest.fn(), find: jest.fn(), insertMany: jest.fn(), findById: jest.fn(),
};
const reservationModel = {
  find: jest.fn(), findOne: jest.fn(), create: jest.fn(), updateOne: jest.fn(),
  countDocuments: jest.fn(), aggregate: jest.fn(),
};
const ensureRestaurantPrices = jest.fn((restaurants) => restaurants);

jest.mock("../../../models/user.model", () => userModel);
jest.mock("../../../models/restaurant.model", () => restaurantModel);
jest.mock("../../../models/reservation.model", () => reservationModel);
jest.mock("../../../repositories/restaurant.repository", () => ({ ensureRestaurantPrices }));

const repository = require("../../../repositories/user.repository");

function chain(result: unknown) {
  const query: any = {
    select: jest.fn(), populate: jest.fn(), skip: jest.fn(), limit: jest.fn(),
    sort: jest.fn(), lean: jest.fn(),
  };
  Object.keys(query).forEach((key) => query[key].mockReturnValue(query));
  query.then = (resolve) => Promise.resolve(result).then(resolve);
  return query;
}

beforeEach(() => jest.clearAllMocks());

describe("user repository identity methods", () => {
  test("findByEmail passes the exact email query", () => {
    const query = chain({ id: "user" }); userModel.findOne.mockReturnValue(query);
    expect(repository.findByEmail("USER@example.com")).toBe(query);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: "USER@example.com" });
    expect(query.select).not.toHaveBeenCalled();
  });

  test("findByEmail explicitly selects a password when requested", () => {
    const query = chain({}); userModel.findOne.mockReturnValue(query);
    expect(repository.findByEmail("user@example.com", true)).toBe(query);
    expect(query.select).toHaveBeenCalledWith("+password");
  });

  test("findById supports normal and password-inclusive lookup", () => {
    const normal = chain({}); const secured = chain({});
    userModel.findById.mockReturnValueOnce(normal).mockReturnValueOnce(secured);
    expect(repository.findById("one")).toBe(normal);
    expect(repository.findById("two", true)).toBe(secured);
    expect(queryCalls(userModel.findById)).toEqual(["one", "two"]);
    expect(secured.select).toHaveBeenCalledWith("+password");
  });

  test("createUser and deleteUser delegate payload and id unchanged", async () => {
    const payload = { email: "new@example.com" }; const created = { _id: "new" };
    userModel.create.mockResolvedValue(created); userModel.findByIdAndDelete.mockResolvedValue(created);
    await expect(repository.createUser(payload)).resolves.toBe(created);
    await expect(repository.deleteUser("new")).resolves.toBe(created);
    expect(userModel.create).toHaveBeenCalledWith(payload);
    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith("new");
  });

  test("model rejections propagate to the service layer", async () => {
    userModel.create.mockRejectedValue(new Error("database unavailable"));
    await expect(repository.createUser({})).rejects.toThrow("database unavailable");
  });
});

describe("listUsers", () => {
  test("returns paginated users without a search filter", async () => {
    const users = [{ _id: "1" }]; const query = chain(users);
    userModel.find.mockReturnValue(query); userModel.countDocuments.mockResolvedValue(12);
    await expect(repository.listUsers({ page: "2", limit: "5" })).resolves.toEqual({ users, meta: { page: 2, limit: 5, total: 12, totalPages: 3 } });
    expect(userModel.find).toHaveBeenCalledWith({}); expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.limit).toHaveBeenCalledWith(5); expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  test("builds the existing case-insensitive name and email search", async () => {
    const query = chain([]); userModel.find.mockReturnValue(query); userModel.countDocuments.mockResolvedValue(0);
    await repository.listUsers({ search: " Dawa " });
    const filter = { $or: [{ fullName: { $regex: "Dawa", $options: "i" } }, { email: { $regex: "Dawa", $options: "i" } }] };
    expect(userModel.find).toHaveBeenCalledWith(filter); expect(userModel.countDocuments).toHaveBeenCalledWith(filter);
  });

  test("propagates a failed model query", async () => {
    const query = chain([]); query.then = (_resolve, reject) => Promise.reject(new Error("query failed")).then(_resolve, reject);
    userModel.find.mockReturnValue(query); userModel.countDocuments.mockResolvedValue(0);
    await expect(repository.listUsers({})).rejects.toThrow("query failed");
  });
});

describe("restaurant and favourite repository operations", () => {
  test("returns existing restaurants without inserting seeds", async () => {
    restaurantModel.countDocuments.mockResolvedValue(2); const query = chain([{ name: "Existing" }]); restaurantModel.find.mockReturnValue(query);
    await expect(repository.listRestaurants()).resolves.toEqual([{ name: "Existing" }]);
    expect(restaurantModel.insertMany).not.toHaveBeenCalled(); expect(query.sort).toHaveBeenCalledWith({ name: 1 });
  });

  test("inserts seed restaurants only when the collection is empty", async () => {
    restaurantModel.countDocuments.mockResolvedValue(0); restaurantModel.insertMany.mockResolvedValue([]);
    const query = chain([{ name: "The Golden Truffle" }]); restaurantModel.find.mockReturnValue(query);
    await repository.listRestaurants();
    expect(restaurantModel.insertMany).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ cuisine: "French" })]));
    expect(ensureRestaurantPrices).toHaveBeenCalled();
  });

  test("getRestaurantById delegates the identifier", async () => {
    const query = chain({ _id: "restaurant" }); restaurantModel.findById.mockReturnValue(query);
    await expect(repository.getRestaurantById("restaurant")).resolves.toEqual({ _id: "restaurant" });
    expect(restaurantModel.findById).toHaveBeenCalledWith("restaurant");
  });

  test("toggleFavorite returns null for a missing user", async () => {
    userModel.findById.mockResolvedValue(null);
    await expect(repository.toggleFavorite("user", "64b000000000000000000000")).resolves.toBeNull();
  });

  test("toggleFavorite adds, saves, and repopulates a favourite", async () => {
    const user = { favorites: [], save: jest.fn().mockResolvedValue(undefined) };
    const populated = { favorites: [{ _id: "64b000000000000000000000" }] };
    userModel.findById.mockResolvedValueOnce(user).mockReturnValueOnce(chain(populated));
    await expect(repository.toggleFavorite("user", "64b000000000000000000000")).resolves.toEqual({ isFavorite: true, favorites: populated });
    expect(user.favorites).toHaveLength(1); expect(user.save).toHaveBeenCalled();
  });

  test("toggleFavorite removes an existing favourite", async () => {
    const favorite = { toString: () => "64b000000000000000000000" };
    const user = { favorites: [favorite], save: jest.fn().mockResolvedValue(undefined) };
    userModel.findById.mockResolvedValueOnce(user).mockReturnValueOnce(chain({ favorites: [] }));
    const result = await repository.toggleFavorite("user", "64b000000000000000000000");
    expect(result.isFavorite).toBe(false); expect(user.favorites).toEqual([]);
  });
});

describe("reservation repository operations", () => {
  const payload = { restaurantId: "restaurant", restaurantName: "Bistro", reservationDate: "2030-01-01", date: "2030-01-01", time: "7:00 PM", guests: 2, paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 500 };

  test("createReservation rejects missing users and restaurants without writes", async () => {
    userModel.findById.mockResolvedValueOnce(null);
    await expect(repository.createReservation("missing", payload)).resolves.toBeNull();
    userModel.findById.mockResolvedValueOnce({ _id: "user" }); restaurantModel.findById.mockResolvedValueOnce(null);
    await expect(repository.createReservation("user", payload)).resolves.toBeNull();
    expect(reservationModel.create).not.toHaveBeenCalled();
  });

  test("createReservation builds and returns the persisted reservation", async () => {
    userModel.findById.mockResolvedValue({ _id: "user" });
    restaurantModel.findById.mockResolvedValue({ _id: "restaurant", cuisine: "Italian", image: "image.jpg", location: "Kathmandu", address: "Street" });
    reservationModel.create.mockImplementation(async (value) => ({ _id: "booking", ...value }));
    const result = await repository.createReservation("user", payload);
    expect(result).toMatchObject({ _id: "booking", user: "user", restaurant: "restaurant", status: "confirmed", paymentStatus: "simulated_success" });
    expect(reservationModel.create).toHaveBeenCalledWith(expect.objectContaining({ guests: 2, totalPaid: 500 }));
  });

  test("getReservationWithDetails uses ownership and populates restaurant", () => {
    const query = chain({}); reservationModel.findOne.mockReturnValue(query);
    expect(repository.getReservationWithDetails("booking", "user")).toBe(query);
    expect(reservationModel.findOne).toHaveBeenCalledWith({ _id: "booking", user: "user" });
    expect(query.populate).toHaveBeenCalledWith("restaurant");
  });

  test("updateReservation returns null or saves only supplied fields", async () => {
    reservationModel.findOne.mockResolvedValueOnce(null);
    await expect(repository.updateReservation("user", "missing", { guests: 4 })).resolves.toBeNull();
    const booking = { date: "old", time: "old", guests: 2, specialRequests: "", reservationDate: new Date(), save: jest.fn().mockResolvedValue(undefined) };
    reservationModel.findOne.mockResolvedValueOnce(booking);
    await expect(repository.updateReservation("user", "booking", { date: "new", time: "8:00 PM", guests: 4, specialRequests: "Window", reservationDate: "2031-01-01" })).resolves.toBe(booking);
    expect(booking).toMatchObject({ date: "new", time: "8:00 PM", guests: 4, specialRequests: "Window" }); expect(booking.save).toHaveBeenCalled();
  });

  test("cancelReservation handles missing, denied, past, and future reservations", async () => {
    reservationModel.findOne.mockResolvedValueOnce(null);
    await expect(repository.cancelReservation("user", "missing")).resolves.toBeNull();
    reservationModel.findOne.mockResolvedValueOnce({ status: "completed" });
    await expect(repository.cancelReservation("user", "done")).resolves.toEqual({ cancellationDenied: true });
    reservationModel.findOne.mockResolvedValueOnce({ status: "confirmed", reservationDate: new Date("2020-01-01"), time: "7:00 PM" });
    await expect(repository.cancelReservation("user", "past")).resolves.toEqual({ cancellationDenied: true });
    const future = { status: "confirmed", reservationDate: new Date("2099-01-01"), time: "7:00 PM", save: jest.fn().mockResolvedValue(undefined) };
    reservationModel.findOne.mockResolvedValueOnce(future);
    await expect(repository.cancelReservation("user", "future")).resolves.toBe(future);
    expect(future.status).toBe("cancelled"); expect(future.save).toHaveBeenCalled();
  });

  test("listUserReservations returns null for an unknown user and chains the owned query", async () => {
    userModel.findById.mockResolvedValueOnce(null);
    await expect(repository.listUserReservations("missing")).resolves.toBeNull();
    userModel.findById.mockResolvedValueOnce({ reservations: [] }); const query = chain([{ _id: "booking" }]); reservationModel.find.mockReturnValue(query);
    await expect(repository.listUserReservations("user")).resolves.toEqual([{ _id: "booking" }]);
    expect(reservationModel.find).toHaveBeenCalledWith({ user: "user" }); expect(query.populate).toHaveBeenCalledWith("restaurant");
  });
});

function queryCalls(mock: jest.Mock) { return mock.mock.calls.map((call) => call[0]); }
