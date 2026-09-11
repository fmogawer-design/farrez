import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { WebhookHandlers } from "./stripe/webhook-handlers";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env["REPLIT_DOMAINS"]?.split(",").filter(Boolean).map((domain) => `https://${domain}`) ?? []),
]);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin) || /\.replit\.dev$/.test(origin) || /\.repl\.co$/.test(origin)) callback(null, true);
  else callback(new Error("Origin not allowed by CORS"));
} }));
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res): Promise<void> => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature." });
      return;
    }

    try {
      const value = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, value);
      res.status(200).json({ received: true });
    } catch (error) {
      req.log.warn({ err: error }, "Stripe webhook processing failed");
      res.status(400).json({ error: "Webhook processing failed." });
    }
  },
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
