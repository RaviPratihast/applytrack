import { Router } from "express";
import applicationsStore from "../store/applicationsStore.js";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await applicationsStore.getAll();
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result.data);
});

router.get("/:id", async (req, res) => {
  const result = await applicationsStore.getById(req.params.id);
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json({ application: result.data });
});

router.post("/", async (req, res) => {
  console.log("POST route hit");
  console.log("Body:", req.body);
  const created = applicationsStore.createFromPayload(req.body);
  if (!created.ok) {
    return res.status(created.statusCode).json({ error: created.error });
  }
  const added = await applicationsStore.add(created.data);
  if (!added.ok) {
    console.error("[POST /api/applications] add failed:", added.error);
    return res.status(added.statusCode).json({ error: added.error });
  }
  res.status(201).json(added.data);
});

router.put("/:id", async (req, res) => {
  const result = await applicationsStore.updateFromPayload(req.params.id, req.body);
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result.data);
});

router.delete("/:id", async (req, res) => {
  const result = await applicationsStore.remove(req.params.id);
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json({ success: true });
});

export default router;
