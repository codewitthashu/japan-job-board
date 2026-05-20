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
  const [dark, setDark] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load dark mode & saved jobs from localStorage
  useEffect(() => {
    const savedDark = localStorage.getItem("darkMode");
    if (savedDark === "true") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [dark]);

  // Fetch jobs
  useEffect(() => {
    axios.get("https://japan-job-board.onrender.com/api/jobs")
      .then((res: { data: Job[] }) => setJobs(res.data))
      .catch(() => console.log("Backend not running"))
      .finally(() => setLoading(false));
  }, []);

  // Toggle save/un-save
  const toggleSave = (title: string) => {
    setSavedJobs((prev) => {
      const newSaved = prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title];
      localStorage.setItem("savedJobs", JSON.stringify(newSaved));
      return newSaved;
    });
  };

  // Filter logic
  const filtered = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const saved = savedJobs.includes(job.title);
    return showSavedOnly ? saved : matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            🇯🇵 Japan Dev Jobs
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} jobs
            </span>
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 text-sm border rounded-md dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by title or tech..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-white dark:bg-gray-800 dark:text-white"
            disabled={showSavedOnly}
          />
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition ${showSavedOnly
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
          >
            {showSavedOnly ? "★ Saved" : "☆ Save Filter"}
          </button>
        </div>

        {loading && <p className="text-gray-500 dark:text-gray-400 text-center">Loading jobs...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center">No jobs found.</p>
        )}

        <div className="space-y-4">
          {filtered.map((job, i) => (
            <JobCard
              key={i}
              job={job}
              isSaved={savedJobs.includes(job.title)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Built by <span className="font-medium text-gray-700 dark:text-gray-200">Ashish Chudasama</span> — Job board for Japan 🇯🇵
      </footer>
    </div>
  );
}