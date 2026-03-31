require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

connectDB();

const app = express();

// CORS middleware: allow all origins
app.use(
  cors({
    origin: true, // Reflect request origin, effectively allowing everyone
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Type", "X-Total-Count"], // Headers accessible to client
    maxAge: 86400, // 24 hours
    preflightContinue: false, // Send 204 No Content for preflight
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

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "FlowDay API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
