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

    // Extract the JSON from the <script id="__NEXT_DATA__"> tag
    const match = data.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) {
      console.log("Could not find __NEXT_DATA__ script tag");
      return fallbackJobs;
    }

    const parsed = JSON.parse(match[1]);
    
    // Navigate to the job listings in the GraphQL initial state
    const initialState = parsed?.props?.pageProps?.__apollo?.graphqlGatewayInitialState;
    if (!initialState) {
      console.log("Could not find GraphQL initial state");
      return fallbackJobs;
    }

    const jobs: Job[] = [];
    
    // Get the searched job posts from the index page
    const searchResults = initialState['ROOT_QUERY']?.projectIndexPageJobPostIndex?.searchedJobPosts;
    if (!searchResults?.edges) {
      console.log("Could not find searched job posts");
      return fallbackJobs;
    }

    console.log(`Found ${searchResults.edges.length} job posts from GraphQL`);

    // Process each job
    for (const edge of searchResults.edges) {
      const jobPostRef = edge?.node?.jobPost?.__ref;
      if (!jobPostRef) continue;

      // The ref looks like: "JobPost:{\"id\":\"1736360\"}"
      const jobPostIdMatch = jobPostRef.match(/JobPost:\{.*"id":"([^"]+)".*\}/);
      if (!jobPostIdMatch) continue;

      const jobPostKey = jobPostRef;
      const jobPost = initialState[jobPostKey];
      if (!jobPost) continue;

      // Get company info
      let companyName = "Unknown Company";
      const companyRef = jobPost?.company?.__ref;
      if (companyRef) {
        const company = initialState[companyRef];
        if (company?.name) {
          companyName = company.name;
        }
      }

      const title = jobPost.title || "Untitled Position";
      const occupationName = jobPost.occupationName || "";
      const publishedAt = jobPost.publishedAt 
        ? new Date(jobPost.publishedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
        : "Recent";
      
      // Build URL
      const jobId = jobPost.id || "";
      const companySlug = initialState[companyRef]?.slug || "unknown";
      const jobUrl = `https://www.wantedly.com/companies/${companySlug}/post_articles/${jobId}`;

      // Extract technologies/occupation as tags
      const technologies: string[] = [];
      if (occupationName) {
        technologies.push(occupationName);
      }
      
      // Add hiring types as tags
      if (jobPost.hiringTypes && Array.isArray(jobPost.hiringTypes)) {
        for (const ht of jobPost.hiringTypes) {
          if (ht?.label) technologies.push(ht.label);
        }
      }

      // Location: Wantedly often doesn't provide explicit location, but we can infer
      const location = jobPost.country === "JP" ? "Japan" : "Remote / Japan";

      if (title && companyName) {
        jobs.push({
          title,
          company: companyName,
          location,
          url: jobUrl,
          technologies: technologies.slice(0, 5), // Limit to 5 tags
          postedDate: publishedAt,
        });
      }
    }

    console.log(`Successfully scraped ${jobs.length} jobs from Wantedly GraphQL`);
    
    if (jobs.length === 0) {
      console.log("Returning fallback data");
      return fallbackJobs;
    }

    return jobs;
    
  } catch (error: any) {
    console.error("Error scraping Wantedly:", error.message);
    console.log("Returning fallback data");
    return fallbackJobs;
  }
}