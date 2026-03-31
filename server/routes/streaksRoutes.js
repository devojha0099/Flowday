const express = require("express");
const r = express.Router();
const { getStreaks } = require("../controllers/streaksController");
const { verifyToken } = require("../middleware/authMiddleware");

r.use(verifyToken);
r.get("/", getStreaks);

module.exports = r;
