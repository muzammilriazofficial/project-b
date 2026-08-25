require("dotenv").config();
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { method, url } = req;

  if (url === "/" || url === "") {
    return res.status(200).json({ message: "API is running" });
  }

  let body = {};
  if (req.body) {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  try {
    await connectDB();

    if (method === "POST" && url === "/api/auth/register") {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({ name, email, password });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      return res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    }

    if (method === "POST" && url === "/api/auth/login") {
      const { email, password } = body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      return res.status(200).json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    }

    if (method === "GET" && url === "/api/auth/me") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      return res.status(200).json({ id: user._id, name: user.name, email: user.email });
    }

    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
