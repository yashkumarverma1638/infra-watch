// controllers/userController.js
const prisma = require("../config/prisma");

exports.getMe = async (req, res) => {
  const userId = req.userId;
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      plan: true,
    },
  });

  res.json(user);
};
