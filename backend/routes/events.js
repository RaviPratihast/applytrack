import { Router } from "express";
import eventsStore from "../store/eventsStore.js";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const result = await eventsStore.getByApplicationId(req.params.applicationId);
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.json({ events: result.data });
});

router.post("/", async (req, res) => {
  const { eventType, note } = req.body ?? {};
  if (!eventType || typeof eventType !== "string" || !eventType.trim()) {
    return res.status(400).json({ error: "eventType is required" });
  }
  const result = await eventsStore.add(req.params.applicationId, eventType.trim(), note ?? "");
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.status(201).json(result.data);
});

export default router;
