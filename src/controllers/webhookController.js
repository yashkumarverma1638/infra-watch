const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prisma");

const endpointSecret =
  "whsec_892860e4607a1fd2d5a0bf4277d676edbbeac200b19cc7d77001400b94451e73";

exports.stripeWebhook = async (req, res) => {
  try {
    console.log("BODY TYPE:", req.body.constructor.name);

    const event = JSON.parse(req.body.toString()); // ✅ FIX

    console.log("EVENT TYPE:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email = session.customer_email;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "PRO" },
        });

        console.log("✅ User upgraded:", user.id);
      } else {
        console.log("❌ User not found");
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Webhook error");
  }
};
