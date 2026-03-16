import { Router } from "express";
import tagsStore from "../store/tagsStore.js";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await tagsStore.getAll();
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.json({ tags: result.data });
});

router.post("/", async (req, res) => {
  const { name, color } = req.body ?? {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const result = await tagsStore.create(name, color);
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.status(201).json(result.data);
});

router.delete("/:id", async (req, res) => {
  const result = await tagsStore.remove(req.params.id);
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.json({ success: true });
});

export default router;
