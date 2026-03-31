const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // ✅ ADD THIS
const { sendEmail } = require("../services/emailService"); // ✅ ADD THIS

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists with this email",
    });
  }
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ userId: user.id }, "secret", { expiresIn: "7d" });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
    },
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // ✅ Security: don't reveal if user exists
    if (!user) {
      return res.json({ message: "If email exists, link sent 📧" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;
    // console.log("recipient", req.body.email);
    await sendEmail({
      to: req.body.email,
      subject: "Reset Password",
      html: `
        <h2>Reset Password</h2>
        <p>Click below to reset:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ message: "Reset link sent 📧" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Weak password" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    res.json({ message: "Password updated ✅" });
  } catch {
    res.status(500).json({ error: "Reset failed" });
  }
};
