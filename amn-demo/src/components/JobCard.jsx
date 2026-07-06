import { Link } from 'react-router-dom';
import { trackClick } from '../utils/analytics';
import './JobCard.css';

export default function JobCard({ job }) {
  const handleClick = () => {
    trackClick(`Job: ${job.title}`, `/job/${job.id}`, '/search');
  };

  return (
    <Link to={`/job/${job.id}`} className="job-card" onClick={handleClick}>
      <div className="job-badges">
        {job.perDiem && <span className="badge badge-green">Per Diem</span>}
        {job.exclusive && <span className="badge badge-teal">Exclusive</span>}
      </div>
      <div className="job-header">
        <h3 className="job-title">{job.title}</h3>
        <button className="job-favorite" aria-label="Save job">
          ♡
        </button>
      </div>
      <div className="job-details">
        <div className="job-detail">
          <span className="icon">📍</span>
          <span>{job.location}</span>
        </div>
        <div className="job-detail">
          <span className="icon">🕐</span>
          <span>{job.schedule}</span>
        </div>
        <div className="job-detail">
          <span className="icon">📅</span>
          <span>Start: {job.startDate}</span>
        </div>
      </div>
      <div className="job-pay">
        ${job.payRange.min}-${job.payRange.max}
      </div>
    </Link>
  );
}
