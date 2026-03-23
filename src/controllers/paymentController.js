const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prisma");

// ✅ CREATE CHECKOUT SESSION
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription`,
      metadata: {
        userId: userId.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
};

// ✅ WEBHOOK HANDLER (ADD THIS)

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
          data: {
            plan: "PRO",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          },
        });

        console.log("✅ User upgraded:", user.id);
      } else {
        console.log("❌ User not found");
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const subscription = event.data.object;

      await prisma.user.update({
        where: { stripeSubscriptionId: subscription.subscription },
        data: {
          subscriptionStatus: "active",
          currentPeriodEnd: new Date(subscription.period_end * 1000),
        },
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;

      await prisma.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          plan: "FREE",
          subscriptionStatus: "canceled",
        },
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Webhook error");
  }
};
