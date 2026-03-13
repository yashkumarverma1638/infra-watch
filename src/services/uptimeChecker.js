const axios = require("axios");
const prisma = require("../config/prisma");

async function checkUrls() {
  const urls = await prisma.url.findMany();

  for (const item of urls) {
    const start = Date.now();

    try {
      await axios.get(item.url);

      const responseTime = Date.now() - start;

      await prisma.uptimeLog.create({
        data: {
          urlId: item.id,
          status: "UP",
          responseTime,
        },
      });

      console.log(item.url, "UP");
    } catch (err) {
      await prisma.uptimeLog.create({
        data: {
          urlId: item.id,
          status: "DOWN",
          responseTime: 0,
        },
      });

      console.log(item.url, "DOWN");
    }
  }
}

module.exports = checkUrls;
