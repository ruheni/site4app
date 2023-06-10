import { prisma } from "#/db";
import { stripe } from "#/lib/api/billing";
import {
  CHECKOUT_CANCEL_URL,
  CHECKOUT_SUCCESS_URL,
} from "#/lib/api/billing/urls";
import { createEndpoint } from "#/lib/api/create-endpoint";
import { verifyApp, verifyUser } from "#/lib/api/token";

export default createEndpoint({
  GET: async ({ req, res }) => {
    const user = await verifyUser(req);
    const app = await verifyApp(req, user.id);

    const prices = await stripe.prices.list({
      lookup_keys: ["pro"],
      expand: ["data.product"],
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: CHECKOUT_SUCCESS_URL,
      cancel_url: CHECKOUT_CANCEL_URL,
    });

    await prisma.billing.create({
      data: {
        app_id: app.id,
        session_id: session.id,
      },
    });

    res.redirect(303, session.url ?? CHECKOUT_CANCEL_URL);
  },
});
