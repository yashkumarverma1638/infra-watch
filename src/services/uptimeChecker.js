const axios = require("axios");
const prisma = require("../config/prisma");

async function checkUrls(io) {
  const urls = await prisma.url.findMany();

  for (const item of urls) {
    const start = Date.now();

    try {
      const res = await axios.head(item.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        },
        timeout: 5000,
        validateStatus: () => true,
      });

      const responseTime = Date.now() - start;
      const status = res.status < 500 ? "UP" : "DOWN";

      await prisma.uptimeLog.create({
        data: {
          urlId: item.id,
          status,
          responseTime,
        },
      });

      // 🔴 realtime event
      io.emit("monitor:update", {
        urlId: item.id,
        status,
        responseTime,
      });
    } catch (err) {
      await prisma.uptimeLog.create({
        data: {
          urlId: item.id,
          status: "DOWN",
          responseTime: 0,
        },
      });

      io.emit("monitor:update", {
        urlId: item.id,
        status: "DOWN",
        responseTime: 0,
      });
    }
  }
}

module.exports = checkUrls;
