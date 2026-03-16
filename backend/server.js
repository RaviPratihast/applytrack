import "dotenv/config";
import express from "express";
import cors from "cors";
import applicationsRouter from "./routes/applications.js";
import eventsRouter from "./routes/events.js";
import tagsRouter from "./routes/tags.js";
import { testConnection } from "./db.js";

const app = express();
// eslint-disable-next-line no-undef -- process is a Node.js global
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/health/db", async (_req, res) => {
  const result = await testConnection();
  if (!result.ok) {
    res.status(503).json({ ok: false, db: "disconnected", error: result.error });
    return;
  }
  res.json({ ok: true, db: "connected" });
});

app.use("/api/applications", applicationsRouter);
app.use("/api/applications/:applicationId/events", eventsRouter);
app.use("/api/tags", tagsRouter);

// 404 middleware - catch all routes that are not defined
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});
// eslint-disable-next-line no-unused-vars -- Express error middleware requires 4 params
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
