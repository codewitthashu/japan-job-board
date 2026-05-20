import axios from "axios";
import * as cheerio from "cheerio";
import { Job } from "./scraper";

export async function scrapeJapanDev(): Promise<Job[]> {
  const url = "https://japan-dev.com/jobs";
  try {
    console.log("Fetching japan-dev.com...");
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) …",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const jobs: Job[] = [];

    $("[class*='JobCard_jobCard']").each((i, element) => {
      const $el = $(element);
      const title = $el.find("h3").text().trim() ||
                    $el.find("[class*='title']").first().text().trim();
      const company = $el.find("[class*='company']").first().text().trim() ||
                      $el.find("[class*='employer']").first().text().trim();
      const location = $el.find("[class*='location']").first().text().trim() || "Japan";
      const relativeUrl = $el.find("a").attr("href") || "";
      const fullUrl = relativeUrl.startsWith("http") ? relativeUrl : `https://japan-dev.com${relativeUrl}`;
      
      const technologies: string[] = [];
      $el.find("[class*='skill'], [class*='tag'], [class*='badge']").each((_, tag) => {
        const tech = $(tag).text().trim();
        if (tech) technologies.push(tech);
      });

      const postedDate = $el.find("[class*='date'], [class*='posted'], time").first().text().trim() || "Recent";

      if (title && company) {
        jobs.push({ title, company, location, url: fullUrl, technologies, postedDate });
      }
    });

    console.log(`Scraped ${jobs.length} jobs from japan-dev.com`);
    return jobs;
  } catch (error: any) {
    console.error("Error scraping japan-dev.com:", error.message);
    return [];
  }
}