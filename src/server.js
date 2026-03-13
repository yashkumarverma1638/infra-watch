require("dotenv").config();
require("./jobs/monitorJob");
const express = require("express");
const cors = require("cors");
const urlRoutes = require("./routes/urlRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ status: "Monitoring API running" });
});
app.use("/api/urls", urlRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
