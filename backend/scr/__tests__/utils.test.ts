const mongoose = require("mongoose");
const { asyncHandler, isValidObjectId, parsePagination, sendError, sendSuccess, toSafeUser } = require("../utils/apihelper.utils");

describe("backend utility helpers", () => {
  test("parses and bounds pagination", () => {
    expect(parsePagination({ page: "3", limit: "20" })).toEqual({ page: 3, limit: 20, skip: 40 });
    expect(parsePagination({ page: "-1", limit: "500" })).toEqual({ page: 1, limit: 100, skip: 0 });
  });

  test("validates MongoDB object IDs", () => {
    expect(isValidObjectId(new mongoose.Types.ObjectId().toString())).toBe(true);
    expect(isValidObjectId("not-an-id")).toBe(false);
  });

  test("formats success and error responses", () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    sendSuccess({ status }, 201, { data: { id: 1 } });
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
    sendError({ status }, 400, "Invalid", { field: "email" });
    expect(json).toHaveBeenLastCalledWith({ success: false, message: "Invalid", details: { field: "email" } });
  });

  test("removes password data from safe users", () => {
    const safe = toSafeUser({ _id: new mongoose.Types.ObjectId(), fullName: "User", email: "user@example.com", password: "secret", role: "user" });
    expect(safe.email).toBe("user@example.com");
    expect(safe.password).toBeUndefined();
  });

  test("forwards rejected async handlers", async () => {
    const error = new Error("failure");
    const next = jest.fn();
    await asyncHandler(async () => { throw error; })({}, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
