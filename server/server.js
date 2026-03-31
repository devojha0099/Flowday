require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(
  cors({
    origin: "*"
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/plans", require("./routes/planRoutes"));
app.use("/api/entries", require("./routes/entryRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/streaks", require("./routes/streaksRoutes"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/pomodoro", require("./routes/pomodoroRoutes"));
app.use("/api", require("./routes/publicRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "FlowDay API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
