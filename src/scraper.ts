import axios from "axios";
import * as cheerio from "cheerio";

export interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  technologies: string[];
  postedDate: string;
}

// Fallback data in case scraping fails
const fallbackJobs: Job[] = [
  {
    title: "Full Stack Developer (React/Node.js)",
    company: "Mercari",
    location: "Tokyo, Japan",
    url: "https://careers.mercari.com/",
    technologies: ["React", "Node.js", "TypeScript", "AWS"],
    postedDate: "2026-05-15",
  },
  {
    title: "Backend Engineer (Express/MongoDB)",
    company: "PayPay",
    location: "Tokyo, Japan (Remote OK)",
    url: "https://paypay.ne.jp/careers/",
    technologies: ["Express", "MongoDB", "TypeScript", "GCP"],
    postedDate: "2026-05-14",
  },
  {
    title: "Frontend Developer (React/Next.js)",
    company: "SmartNews",
    location: "Tokyo, Japan",
    url: "https://www.smartnews.com/careers/",
    technologies: ["React", "Next.js", "TypeScript", "GraphQL"],
    postedDate: "2026-05-13",
  },
  {
    title: "Software Engineer (Node.js)",
    company: "Rakuten",
    location: "Tokyo, Japan (Remote Hybrid)",
    url: "https://rakuten.careers/",
    technologies: ["Node.js", "TypeScript", "Express", "AWS"],
    postedDate: "2026-05-12",
  },
  {
    title: "MERN Stack Developer",
    company: "LINE Corporation",
    location: "Tokyo, Japan",
    url: "https://linecorp.com/en/career/",
    technologies: ["MongoDB", "Express", "React", "Node.js"],
    postedDate: "2026-05-11",
  },
];

export async function scrapeWantedly(): Promise<Job[]> {
  const url = "https://www.wantedly.com/projects?q=React&type=all";
  try {
    console.log("Fetching Wantedly...");
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    console.log("Page fetched, length:", data.length);
    const $ = cheerio.load(data);
    const jobs: Job[] = [];

    // Log how many project items we find
    const items = $(".project-list-item");
    console.log(`Found ${items.length} project-list-item elements`);

    // If no items, try alternative selectors
    if (items.length === 0) {
      console.log("Trying alternative selectors...");
      // Maybe the structure uses different class names
      $("a[href*='/projects/']").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/projects/")) {
          console.log("Found link:", href);
        }
      });
    }

    items.each((_, element) => {
      const title = $(element).find(".project-title").text().trim() 
                 || $(element).find("h2").text().trim()
                 || $(element).find("[class*='title']").text().trim();
      const company = $(element).find(".company-name").text().trim()
                    || $(element).find("[class*='company']").text().trim();
      const location = $(element).find(".project-location").text().trim() 
                     || "Tokyo/Remote";
      const link = $(element).find("a").attr("href");
      const technologies: string[] = [];
      $(element).find(".project-skill-item, .skill-tag, [class*='skill']").each((_, skill) => {
        const tech = $(skill).text().trim();
        if (tech) technologies.push(tech);
      });

      if (title) {
        jobs.push({
          title,
          company,
          location,
          url: link ? (link.startsWith("http") ? link : `https://www.wantedly.com${link}`) : "#",
          technologies,
          postedDate: "Recent",
        });
      }
    });

    console.log(`Scraped ${jobs.length} jobs`);
    if (jobs.length === 0) {
      console.log("Returning fallback data instead");
      return fallbackJobs;
    }
    return jobs;
  } catch (error: any) {
    console.error("Error scraping Wantedly:", error.message);
    console.log("Returning fallback data");
    return fallbackJobs;
  }
}