import { Link, useNavigate } from 'react-router-dom';
import { trackClick } from '../utils/analytics';
import Button from '../components/Button';
import './JobDetailPage.css';

export default function JobDetailPage() {
  const navigate = useNavigate();

  const handleApply = () => {
    trackClick('Apply Now (job detail)', '/apply', '/job/167335');
    navigate('/apply');
  };

  const handleBackToResults = () => {
    trackClick('Back to Results', '/search', '/job/167335');
  };

  return (
    <div className="job-detail-page">
      <div className="job-banner">
        <div className="container">
          <div className="banner-content">
            <span>💰 Earn an Extra Bonus - Refer a Friend today!</span>
            <button className="banner-close" aria-label="Close banner">×</button>
          </div>
        </div>
      </div>
      <div className="container job-detail-container">
        <Link to="/search" className="back-link" onClick={handleBackToResults}>
          ← Results
        </Link>
        <div className="job-detail-layout">
          <main className="job-main">
            <div className="job-header-section">
              <div className="job-badges-row">
                <span className="badge badge-green">Per Diem</span>
                <span className="badge badge-teal">Exclusive</span>
              </div>
              <div className="job-title-row">
                <div>
                  <h1>Emergency Medicine Physician</h1>
                  <p className="job-subtitle">BOARD CERTIFIED/BOARD ELIGIBLE - EMERGENCY MEDICINE</p>
                  <p className="job-id">Job ID: 167335</p>
                </div>
                <button className="favorite-btn" aria-label="Save job">♡</button>
              </div>
            </div>
            <section className="job-section">
              <h2>Job Description</h2>
              <p>
                We are seeking a skilled Emergency Medicine Physician to join our Level II Trauma Center.
                This position offers competitive compensation, excellent work-life balance with flexible scheduling,
                and the opportunity to work with a collaborative healthcare team in a state-of-the-art facility.
              </p>
              <h3>Responsibilities</h3>
              <ul>
                <li>Provide emergency medical care for patients of all acuities</li>
                <li>Perform diagnostic procedures and interpret results</li>
                <li>Stabilize and manage critically ill and injured patients</li>
                <li>Collaborate with specialists and healthcare team members</li>
                <li>Supervise and mentor resident physicians and advanced practice providers</li>
                <li>Maintain accurate and timely medical documentation</li>
              </ul>
              <h3>Education & Requirements</h3>
              <ul>
                <li>MD or DO degree from accredited medical school</li>
                <li>Board Certified or Board Eligible in Emergency Medicine</li>
                <li>Active Ohio medical license or ability to obtain</li>
                <li>DEA license required</li>
                <li>ACLS, BLS, and PALS certifications required</li>
                <li>ATLS certification preferred</li>
              </ul>
            </section>
          </main>
          <aside className="job-sidebar">
            <div className="job-overview">
              <h3>JOB OVERVIEW</h3>
              <div className="overview-item">
                <strong>Facility Type</strong>
                <p>Level II Trauma Center</p>
              </div>
              <div className="overview-item">
                <strong>Facility Address</strong>
                <p>9500 Euclid Avenue<br />Cleveland, OH 44106</p>
              </div>
              <div className="overview-item">
                <strong>Shifts</strong>
                <p>Full-time, 12 shifts/month</p>
              </div>
              <div className="overview-item">
                <strong>Start</strong>
                <p>July 17, 2026</p>
              </div>
              <div className="overview-item pay-item">
                <strong>Hourly Pay</strong>
                <div className="pay-amount">$275 - $325</div>
              </div>
              <Button variant="primary" onClick={handleApply} fullWidth>
                Apply Now
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
