require("dotenv").config();

const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const toSafeUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  profilePicture: user.profilePicture,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

app.get("/", (_req, res) => {
  res.send("MealNest Backend Running");
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "MealNest Backend Running" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: createToken(user._id.toString()),
      user: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      token: createToken(user._id.toString()),
      user: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
});

app.get("/api/auth/current", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    return res.json({ success: true, user: toSafeUser(user) });
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

// Admin User Management Routes

// GET /api/v1/admin/users - Paginated list with search
app.get("/api/v1/admin/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: users.map(toSafeUser),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
});

// GET /api/v1/admin/users/:id - Get single user
app.get("/api/v1/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
});

// POST /api/v1/admin/users - Create user
app.post("/api/v1/admin/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

   if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'user' or 'admin'",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      phoneNumber: phoneNumber || "",
      password: hashedPassword,
      role: role || "user",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
});

// PUT /api/v1/admin/users/:id - Update user
app.put("/api/v1/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role && ["user", "admin"].includes(role)) user.role = role;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    return res.json({
      success: true,
      message: "User updated successfully",
      data: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
});

// PATCH /api/v1/admin/users/:id - Partial update user
app.patch("/api/v1/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role && ["user", "admin"].includes(role)) user.role = role;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    return res.json({
      success: true,
      message: "User updated successfully",
      data: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
});

// DELETE /api/v1/admin/users/:id - Delete user
app.delete("/api/v1/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
});

const PORT = process.env.PORT || 8088;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mealnest";

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
