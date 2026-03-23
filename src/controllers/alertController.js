const prisma = require("../config/prisma");

exports.getAlerts = async (req, res) => {
  try {
    const userId = req.userId;

    // 👉 query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // 👉 total count (important for pagination UI)
    const total = await prisma.alert.count({
      where: {
        url: {
          userId: userId,
        },
      },
    });

    // 👉 paginated data
    const alerts = await prisma.alert.findMany({
      where: {
        url: {
          userId: userId,
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
      skip: skip,
      take: limit,
    });

    res.json({
      data: alerts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};
