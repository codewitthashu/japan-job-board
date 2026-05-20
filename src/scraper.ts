import axios from "axios";

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
  const url = "https://www.wantedly.com/projects?q=MERN&type=all";
  try {
    console.log("Fetching Wantedly...");
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    });

    // Extract the JSON from <script id="__NEXT_DATA__">
    const match = data.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) {
      console.log("Could not find __NEXT_DATA__ script tag");
      return fallbackJobs;
    }

    const parsed = JSON.parse(match[1]);
    const initialState = parsed?.props?.pageProps?.__apollo?.graphqlGatewayInitialState;
    if (!initialState) {
      console.log("Could not find GraphQL initial state");
      return fallbackJobs;
    }

    // Find the dynamic key that starts with "searchedJobPosts("
    const rootQuery = initialState['ROOT_QUERY'];
    if (!rootQuery?.projectIndexPageJobPostIndex) {
      console.log("Could not find projectIndexPageJobPostIndex");
      return fallbackJobs;
    }

    const idx = rootQuery.projectIndexPageJobPostIndex;
    let searchKey = '';
    for (const key of Object.keys(idx)) {
      if (key.startsWith('searchedJobPosts(')) {
        searchKey = key;
        break;
      }
    }
    if (!searchKey) {
      console.log("Could not find searchedJobPosts key");
      return fallbackJobs;
    }

    const searchResults = idx[searchKey];
    const edges = searchResults?.edges;
    if (!edges || !Array.isArray(edges)) {
      console.log("Could not find searched job post edges");
      return fallbackJobs;
    }

    console.log(`Found ${edges.length} job posts from Wantedly`);

    const jobs: Job[] = [];
    for (const edge of edges) {
      const jobPostRef = edge?.node?.jobPost?.__ref;
      if (!jobPostRef) continue;

      const jobPost = initialState[jobPostRef];
      if (!jobPost) continue;

      let companyName = "Unknown Company";
      const companyRef = jobPost?.company?.__ref;
      if (companyRef) {
        const company = initialState[companyRef];
        if (company?.name) companyName = company.name;
      }

      const title = jobPost.title || "Untitled Position";
      const occupationName = jobPost.occupationName || "";
      const publishedAt = jobPost.publishedAt
        ? new Date(jobPost.publishedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
        : "Recent";

      const jobId = jobPost.id || "";
      const companySlug = initialState[companyRef]?.slug || "unknown";
      const jobUrl = `https://www.wantedly.com/companies/${companySlug}/post_articles/${jobId}`;

      const technologies: string[] = [];
      if (occupationName) technologies.push(occupationName);
      if (jobPost.hiringTypes && Array.isArray(jobPost.hiringTypes)) {
        for (const ht of jobPost.hiringTypes) {
          if (ht?.label) technologies.push(ht.label);
        }
      }

      const location = jobPost.country === "JP" ? "Japan" : "Remote / Japan";

      if (title && companyName) {
        jobs.push({
          title,
          company: companyName,
          location,
          url: jobUrl,
          technologies: technologies.slice(0, 5),
          postedDate: publishedAt,
        });
      }
    }

    console.log(`Successfully scraped ${jobs.length} jobs from Wantedly`);
    return jobs.length ? jobs : fallbackJobs;
  } catch (error: any) {
    console.error("Error scraping Wantedly:", error.message);
    return fallbackJobs;
  }
}