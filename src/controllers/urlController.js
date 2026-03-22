const prisma = require("../config/prisma");

exports.addUrl = async (req, res) => {
  try {
    const { url, userId } = req.body;

    const newUrl = await prisma.url.create({
      data: {
        url,
        userId: req.userId,
      },
    });

    res.json({
      message: "URL added for monitoring",
      data: newUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUrls = async (req, res) => {
  const urls = await prisma.url.findMany({
    where: {
      userId: req.userId,
    },
    include: {
      logs: true, // get all logs
    },
  });

  const result = urls.map((url) => {
    const total = url.logs.length;

    const up = url.logs.filter((log) => log.status === "UP").length;

    const uptime = total ? ((up / total) * 100).toFixed(2) + "%" : "100%";

    const latestLog = url.logs.sort(
      (a, b) => new Date(b.checkedAt) - new Date(a.checkedAt),
    )[0];

    return {
      id: url.id,
      url: url.url,
      uptime,
      logs: latestLog ? [latestLog] : [],
    };
  });

  res.json(result);
};

exports.getMetrics = async (req, res) => {
  const { urlId } = req.params;

  const logs = await prisma.uptimeLog.findMany({
    where: {
      urlId: parseInt(urlId),
    },
    orderBy: {
      checkedAt: "desc",
    },
    take: 50,
  });

  res.json(logs);
};

exports.getUptime = async (req, res) => {
  const { urlId } = req.params;

  const logs = await prisma.uptimeLog.findMany({
    where: {
      urlId: parseInt(urlId),
    },
  });

  const total = logs.length;

  const up = logs.filter((l) => l.status === "UP").length;

  const uptime = (up / total) * 100;

  res.json({
    uptime: uptime.toFixed(2) + "%",
  });
};

exports.deleteUrl = async (req, res) => {
  const { id } = req.params;

  await prisma.url.delete({
    where: { id: parseInt(id) },
  });

  res.json({ message: "Monitor deleted" });
};
