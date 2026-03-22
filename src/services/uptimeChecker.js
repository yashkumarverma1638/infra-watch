const axios = require("axios");
const prisma = require("../config/prisma");

async function checkUrls(io) {
  const urls = await prisma.url.findMany({
    include: {
      user: true, // 🔥 get user info
    },
  });

  for (const item of urls) {
    const start = Date.now();
    const userId = String(item.userId); // 🔥 important

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

      // 🔥 Get last log
      const lastLog = await prisma.uptimeLog.findFirst({
        where: { urlId: item.id },
        orderBy: { checkedAt: "desc" },
      });

      // 🔥 Save new log
      await prisma.uptimeLog.create({
        data: {
          urlId: item.id,
          status,
          responseTime,
        },
      });

      if (!lastLog && status === "DOWN") {
        // 🔥 first time DOWN
        const alert = await prisma.alert.create({
          data: {
            urlId: item.id,
            message: `${item.url} is DOWN 🚨`,
            status: "DOWN",
          },
        });

        io.to(userId).emit("alert:new", alert);
      } else if (lastLog && lastLog.status !== status) {
        // 🔥 status changed
        const alert = await prisma.alert.create({
          data: {
            urlId: item.id,
            message:
              status === "DOWN"
                ? `${item.url} is DOWN 🚨`
                : `${item.url} is BACK UP ✅`,
            status,
          },
        });

        io.to(userId).emit("alert:new", alert);
      }

      // 🔴 Emit monitor update ONLY to that user
      io.to(userId).emit("monitor:update", {
        urlId: item.id,
        status,
        responseTime,
      });
    } catch (err) {
      const status = "DOWN";

      const lastLog = await prisma.uptimeLog.findFirst({
        where: { urlId: item.id },
        orderBy: { checkedAt: "desc" },
      });

      await prisma.uptimeLog.create({
        data: {
          urlId: item.id,
          status,
          responseTime: 0,
        },
      });

      // 🔥 ALERT LOGIC
      if (!lastLog || lastLog.status !== "DOWN") {
        const alert = await prisma.alert.create({
          data: {
            urlId: item.id,
            message: `${item.url} is DOWN 🚨`,
            status: "DOWN",
          },
        });

        io.to(userId).emit("alert:new", alert);
      }

      io.to(userId).emit("monitor:update", {
        urlId: item.id,
        status: "DOWN",
        responseTime: 0,
      });
    }
  }
}

module.exports = checkUrls;
