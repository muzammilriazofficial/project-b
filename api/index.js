const app = require("../src/app");
const authRoutes = require("../src/routes/auth");
const withDB = require("../src/middleware/db");

app.use(withDB);
app.use("/api/auth", authRoutes);

module.exports = app;
