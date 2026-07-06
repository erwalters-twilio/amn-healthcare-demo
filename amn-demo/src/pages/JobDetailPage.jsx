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
                  <h1>Neonatal Intensive Care Unit Nurse (NICU RN)</h1>
                  <p className="job-subtitle">REGISTERED NURSE - NICU-LEVEL II</p>
                  <p className="job-id">Job ID: 167335</p>
                </div>
                <button className="favorite-btn" aria-label="Save job">♡</button>
              </div>
            </div>
            <section className="job-section">
              <h2>Job Description</h2>
              <p>
                We are seeking an experienced Neonatal Intensive Care Unit (NICU) Registered Nurse
                to provide exceptional care to our tiniest patients. This Level II NICU position offers
                competitive compensation and the opportunity to work with a dedicated healthcare team.
              </p>
              <h3>Responsibilities</h3>
              <ul>
                <li>Provide specialized nursing care for premature and critically ill newborns</li>
                <li>Monitor vital signs and respond to changes in patient condition</li>
                <li>Administer medications and treatments as prescribed</li>
                <li>Collaborate with neonatologists and healthcare team members</li>
                <li>Support and educate families during challenging times</li>
                <li>Maintain accurate patient records and documentation</li>
              </ul>
              <h3>Education & Requirements</h3>
              <ul>
                <li>Active RN license in Colorado or compact state</li>
                <li>Minimum 1 year of NICU experience required</li>
                <li>BLS and NRP certifications required</li>
                <li>STABLE certification preferred</li>
                <li>Bachelor's degree in Nursing (BSN) preferred</li>
              </ul>
            </section>
          </main>
          <aside className="job-sidebar">
            <div className="job-overview">
              <h3>JOB OVERVIEW</h3>
              <div className="overview-item">
                <strong>Facility Type</strong>
                <p>Short Term Acute Care Hospital</p>
              </div>
              <div className="overview-item">
                <strong>Facility Address</strong>
                <p>7700 S. Broadway<br />Littleton, CO 80122</p>
              </div>
              <div className="overview-item">
                <strong>Shifts</strong>
                <p>7:00 PM - 7:00 AM</p>
              </div>
              <div className="overview-item">
                <strong>Start</strong>
                <p>July 17, 2026</p>
              </div>
              <div className="overview-item pay-item">
                <strong>Hourly Pay</strong>
                <div className="pay-amount">$44 - $47</div>
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
