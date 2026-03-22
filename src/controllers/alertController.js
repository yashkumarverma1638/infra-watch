const prisma = require("../config/prisma");

exports.getAlerts = async (req, res) => {
  try {
    const userId = req.userId; // 🔥 from JWT middleware

    const alerts = await prisma.alert.findMany({
      where: {
        url: {
          userId: userId, // 🔥 filter by logged-in user
        },
      },
      include: {
        url: {
          select: {
            id: true,
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};
