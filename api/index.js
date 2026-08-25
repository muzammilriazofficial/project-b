const serverless = require("serverless-http");
const app = require("../src/app");
const connectDB = require("../src/config/db");

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      return res.status(500).json({ message: "Database connection failed" });
    }
  }
  return serverless(app)(req, res);
};
