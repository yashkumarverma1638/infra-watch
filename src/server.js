require("dotenv").config();

const express = require("express");
const cors = require("cors");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const alertRoutes = require("./routes/alertRoutes");

const { Server } = require("socket.io");
const http = require("http");
const authMiddleware = require("./middleware/auth");
const { user } = require("./config/prisma");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "Monitoring API running" });
});

app.use("/api/urls", authMiddleware, urlRoutes);
app.use("/api/alerts", alertRoutes);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(String(userId));
    console.log("Client connected:", socket.id);
    console.log("Joining room:", String(userId));
  }
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);

  const startMonitorJob = require("./jobs/monitorJob");
  startMonitorJob(io);
});
