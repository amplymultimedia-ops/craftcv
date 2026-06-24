import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { logger } from "hono/logger";
import { authRouter } from "./routes/auth";
import { resumesRouter } from "./routes/resumes";
import { coverLettersRouter } from "./routes/coverLetters";
import { profileRouter } from "./routes/profile";
import { jobAdRouter } from "./routes/jobAd";
import { generateRouter } from "./routes/generate";
import { subscriptionRouter } from "./routes/subscription";

const app = new Hono();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecodeapp\.com$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
];

app.use(
  "*",
  cors({
    origin: (origin) =>
      origin && allowed.some((re) => re.test(origin)) ? origin : null,
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/auth", authRouter);
app.route("/api/resumes", resumesRouter);
app.route("/api/cover-letters", coverLettersRouter);
app.route("/api/profile", profileRouter);
app.route("/api/job-ad", jobAdRouter);
app.route("/api/generate", generateRouter);
app.route("/api/subscription", subscriptionRouter);

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
