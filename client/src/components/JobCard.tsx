interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  technologies: string[];
  postedDate: string;
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{job.title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {job.company} — {job.location}
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {job.technologies.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900 dark:text-blue-200 text-blue-700 rounded-md"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400 dark:text-gray-500">{job.postedDate}</span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          View Job →
        </a>
      </div>
    </div>
  );
}