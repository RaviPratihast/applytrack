import { Router } from "express";
import applicationsStore from "../store/applicationsStore.js";
import tagsStore from "../store/tagsStore.js";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await applicationsStore.getAll();
  if (!result.ok) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result.data);
});

router.get("/export/csv", async (_req, res) => {
  const result = await applicationsStore.getAll();
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });

  const apps = result.data.applications;
  const headers = ["id","company","role","status","appliedDate","notes","resumeVersion","followUpDate","salaryRange","location","jobUrl","companySize"];
  const rows = apps.map(a =>
    headers.map(h => `"${String(a[h] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
  res.send(csv);
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

router.get("/:id/tags", async (req, res) => {
  const result = await tagsStore.getByApplicationId(req.params.id);
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.json({ tags: result.data });
});

router.post("/:id/tags/:tagId", async (req, res) => {
  const result = await tagsStore.addToApplication(req.params.id, req.params.tagId);
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.status(201).json({ success: true });
});

router.delete("/:id/tags/:tagId", async (req, res) => {
  const result = await tagsStore.removeFromApplication(req.params.id, req.params.tagId);
  if (!result.ok) return res.status(result.statusCode).json({ error: result.error });
  res.json({ success: true });
});

export default router;
