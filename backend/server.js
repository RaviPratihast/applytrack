import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";


const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const VALID_STATUSES = ["applied", "interview", "rejected", "offer"];

// In-memory store (no DB yet)
const applications = [
  {
    id: "example-1",
    company: "Acme Corp",
    role: "Software Engineer",
    status: "applied",
    appliedDate: new Date().toISOString(),
    notes: "Applied via company site.",
    resumeVersion: "",
    followUpDate: null,
  },
  {
    id: "example-2",
    company: "TechCo",
    role: "Frontend Developer",
    status: "interview",
    appliedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: "",
    resumeVersion: "",
    followUpDate: null,
  },
];

app.get("/api/applications", (_req, res) => {
  res.json({ applications });
});

app.post("/api/applications", (req, res) => {
  const { company, role, status, appliedDate, notes, resumeVersion, followUpDate } = req.body ?? {};

  const companyTrimmed = typeof company === "string" ? company.trim() : "";
  const roleTrimmed = typeof role === "string" ? role.trim() : "";

  if (!companyTrimmed || !roleTrimmed) {
    res.status(400).json({
      error: "Validation failed",
      message: "company and role are required and must be non-empty",
    });
    return;
  }

  const statusValue = VALID_STATUSES.includes(status) ? status : "applied";
  const newApplication = {
    id: randomUUID(),
    company: companyTrimmed,
    role: roleTrimmed,
    status: statusValue,
    appliedDate: typeof appliedDate === "string" && appliedDate ? appliedDate : new Date().toISOString(),
    notes: typeof notes === "string" ? notes : "",
    resumeVersion: typeof resumeVersion === "string" ? resumeVersion : "",
    followUpDate: followUpDate === null || followUpDate === undefined ? null : followUpDate,
  };

  applications.push(newApplication);
  res.status(201).json(newApplication);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});