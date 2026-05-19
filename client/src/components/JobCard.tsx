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
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      padding: 16,
      margin: "12px 0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    }}>
      <h3 style={{ margin: 0 }}>{job.title}</h3>
      <p style={{ margin: "4px 0", color: "#555" }}>{job.company} — {job.location}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
        {job.technologies.map((tech) => (
          <span key={tech} style={{
            background: "#e3f2fd",
            color: "#1565c0",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 12,
          }}>
            {tech}
          </span>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#999" }}>Posted: {job.postedDate}</p>
      <a href={job.url} target="_blank" rel="noopener noreferrer"
        style={{ color: "#1a73e8", textDecoration: "none", fontWeight: 500 }}>
        View Job →
      </a>
    </div>
  );
}
