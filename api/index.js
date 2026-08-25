const app = require("./app");
const authRoutes = require("./routes/auth");
const withDB = require("./middleware/db");

app.use(withDB);
app.use("/api/auth", authRoutes);

module.exports = app;
