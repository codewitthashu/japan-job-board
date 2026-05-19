import { useEffect, useState } from "react";
import axios from "axios";
import JobCard from "./components/JobCard";

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  technologies: string[];
  postedDate: string;
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:4000/api/jobs")
      .then((res) => setJobs(res.data))
      .catch(() => console.log("Backend not running — showing empty"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>🇯🇵 Japan Developer Jobs</h1>
      <input
        type="text"
        placeholder="Search by title or tech (e.g. React, Node.js)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          marginBottom: 20,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
      {loading && <p>Loading jobs...</p>}
      {!loading && filtered.length === 0 && <p>No jobs found. Try a different search.</p>}
      {filtered.map((job, i) => (
        <JobCard key={i} job={job} />
      ))}
    </div>
  );
}

export default App;