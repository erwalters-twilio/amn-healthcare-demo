import JobCard from '../components/JobCard';
import './JobSearchPage.css';

const MOCK_JOBS = [
  {
    id: '167335',
    title: 'Neonatal Intensive Care Unit Nurse (NICU RN)',
    location: 'Littleton, CO 80122',
    schedule: '7:00 PM - 7:00 AM',
    startDate: 'July 17, 2026',
    payRange: { min: 44, max: 47 },
    perDiem: true,
    exclusive: true,
  },
  {
    id: '167336',
    title: 'Telemetry Nurse (TELE RN)',
    location: 'Denver, CO 80202',
    schedule: '3x12 hour shifts',
    startDate: 'July 24, 2026',
    payRange: { min: 40, max: 43 },
    perDiem: true,
    exclusive: false,
  },
  {
    id: '167337',
    title: 'Emergency Room Nurse (ER RN)',
    location: 'Aurora, CO 80012',
    schedule: 'Rotating shifts',
    startDate: 'August 1, 2026',
    payRange: { min: 45, max: 50 },
    perDiem: false,
    exclusive: true,
  },
  {
    id: '167338',
    title: 'Intensive Care Unit Nurse (ICU RN)',
    location: 'Colorado Springs, CO 80909',
    schedule: 'Night shift',
    startDate: 'July 28, 2026',
    payRange: { min: 42, max: 46 },
    perDiem: true,
    exclusive: false,
  },
  {
    id: '167339',
    title: 'Medical-Surgical Nurse (Med-Surg RN)',
    location: 'Fort Collins, CO 80524',
    schedule: 'Day shift',
    startDate: 'August 5, 2026',
    payRange: { min: 38, max: 42 },
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
                  <span>Nursing</span>
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
