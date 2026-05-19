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

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:4000/api/jobs")
      .then((res) => setJobs(res.data))
      .catch(() => console.log("Backend not running"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            🇯🇵 Japan Dev Jobs
          </h1>
          <span className="text-sm text-gray-500">
            {filtered.length} jobs found
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by title or tech (e.g. React, Node.js)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8 text-lg"
        />

        {/* Loading / Empty */}
        {loading && <p className="text-gray-500 text-center">Loading jobs...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-center">No jobs found.</p>
        )}

        {/* Job Cards */}
        <div className="space-y-4">
          {filtered.map((job, i) => (
            <JobCard key={i} job={job} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6 text-center text-sm text-gray-500">
        Built by <span className="font-medium text-gray-700">Ashish Chudasama</span> — Job board for Japan 🇯🇵
      </footer>
    </div>
  );
}