const connectDB = require("../config/db");

const withDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ message: "Database connection failed" });
  }
};

module.exports = withDB;
