import JobCard from '../components/JobCard';
import './JobSearchPage.css';

const MOCK_JOBS = [
  {
    id: '167335',
    title: 'Emergency Medicine Physician',
    location: 'Cleveland, OH 44106',
    schedule: 'Full-time, 12 shifts/month',
    startDate: 'July 17, 2026',
    payRange: { min: 275, max: 325 },
    perDiem: true,
    exclusive: true,
  },
  {
    id: '167336',
    title: 'Family Medicine Physician',
    location: 'Lakewood, OH 44107',
    schedule: 'Monday-Friday, 8am-5pm',
    startDate: 'July 24, 2026',
    payRange: { min: 225, max: 250 },
    perDiem: true,
    exclusive: false,
  },
  {
    id: '167337',
    title: 'Hospitalist Physician',
    location: 'Parma, OH 44129',
    schedule: '7 on / 7 off',
    startDate: 'August 1, 2026',
    payRange: { min: 250, max: 285 },
    perDiem: false,
    exclusive: true,
  },
  {
    id: '167338',
    title: 'Internal Medicine Physician',
    location: 'Mentor, OH 44060',
    schedule: 'Full-time, outpatient',
    startDate: 'July 28, 2026',
    payRange: { min: 230, max: 260 },
    perDiem: true,
    exclusive: false,
  },
  {
    id: '167339',
    title: 'Urgent Care Physician',
    location: 'Strongsville, OH 44136',
    schedule: 'Flexible shifts',
    startDate: 'August 5, 2026',
    payRange: { min: 200, max: 235 },
    perDiem: false,
    exclusive: false,
  },
];

export default function JobSearchPage() {
  return (
    <div className="job-search-page">
      <div className="search-header">
        <div className="container-wide">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by keywords, location, or job ID..."
              className="search-input"
            />
            <button className="search-button">🔍</button>
          </div>
        </div>
      </div>
      <div className="search-content">
        <div className="container-wide">
          <div className="search-layout">
            <aside className="search-filters">
              <div className="filters-header">
                <h3>Filters</h3>
                <button className="clear-all">Clear All</button>
              </div>
              <div className="filter-group">
                <h4>Profession (1)</h4>
                <label className="filter-option">
                  <input type="checkbox" checked readOnly />
                  <span>Physician</span>
                </label>
              </div>
              <div className="filter-group">
                <h4>Job Type</h4>
                <label className="filter-option">
                  <input type="checkbox" />
                  <span>Per Diem</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" />
                  <span>Travel</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" />
                  <span>Permanent</span>
                </label>
              </div>
              <div className="filter-group">
                <h4>Location</h4>
                <input
                  type="text"
                  placeholder="City, State, or ZIP"
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <h4>Compact State</h4>
                <label className="filter-option">
                  <input type="checkbox" />
                  <span>Compact Only</span>
                </label>
              </div>
            </aside>
            <main className="search-results">
              <div className="results-header">
                <h2>Found {MOCK_JOBS.length} jobs</h2>
                <div className="sort-options">
                  <label htmlFor="sort">Sort by:</label>
                  <select id="sort" className="sort-select">
                    <option>Relevance</option>
                    <option>Newest</option>
                    <option>Start Date</option>
                    <option>Pay (High to Low)</option>
                  </select>
                </div>
              </div>
              <div className="jobs-list">
                {MOCK_JOBS.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
