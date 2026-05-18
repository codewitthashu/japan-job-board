import express from "express";
import cors from "cors";
import { scrapeWantedly } from "./scraper";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

// In-memory cache (simple)
let cachedJobs: any[] = [];
let lastFetch = 0;

app.get("/api/jobs", async (req, res) => {
  const now = Date.now();
  // Cache for 10 minutes
  if (now - lastFetch < 10 * 60 * 1000 && cachedJobs.length > 0) {
    return res.json(cachedJobs);
  }

  const jobs = await scrapeWantedly();
  cachedJobs = jobs;
  lastFetch = now;
  res.json(jobs);
});

app.get("/api/jobs/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const jobs = await scrapeWantedly();
  const filtered = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes((q as string).toLowerCase()) ||
      job.technologies.some((tech: string) =>
        tech.toLowerCase().includes((q as string).toLowerCase())
      )
  );
  res.json(filtered);
});

app.listen(PORT, () => {
  console.log(`Japan Job Board API running on port ${PORT}`);
});