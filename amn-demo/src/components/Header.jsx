import { Link } from 'react-router-dom';
import { useState } from 'react';
import { trackClick } from '../utils/analytics';
import './Header.css';

export default function Header() {
  const [showJobSeekersMenu, setShowJobSeekersMenu] = useState(false);

  const handleNavClick = (text, destination) => {
    trackClick(text, destination, window.location.pathname);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container header-container">
          <Link to="/" className="logo" onClick={() => handleNavClick('Logo', '/')}>
            <img src="/amn-logo.jpeg" alt="AMN Healthcare" />
          </Link>
          <div className="header-actions">
            <Link
              to="/search"
              className="header-link"
              onClick={() => handleNavClick('Search Jobs (header)', '/search')}
            >
              Search Jobs
            </Link>
            <Link
              to="/apply"
              className="header-btn"
              onClick={() => handleNavClick('Apply Now (header)', '/apply')}
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
      <nav className="header-nav">
        <div className="container">
          <ul className="nav-menu">
            <li
              className="nav-item"
              onMouseEnter={() => setShowJobSeekersMenu(true)}
              onMouseLeave={() => setShowJobSeekersMenu(false)}
            >
              <span className="nav-link">Job Seekers</span>
              {showJobSeekersMenu && (
                <div className="job-seekers-dropdown">
                  <div className="dropdown-content">
                    <div className="dropdown-categories">
                      <div className="category-item">Nursing</div>
                      <div className="category-item">Allied</div>
                      <div className="category-item active">Physician</div>
                      <div className="category-item">Advanced Practice</div>
                      <div className="category-item">Dentistry</div>
                      <div className="category-item">Leadership</div>
                    </div>
                    <div className="dropdown-main">
                      <h3>Physician</h3>
                      <p>
                        Join the AMN Healthcare family and enjoy exclusive benefits,
                        competitive compensation, and the support you need to succeed in your
                        physician career.
                      </p>
                      <Link
                        to="/search"
                        className="dropdown-link"
                        onClick={() => handleNavClick('Learn more about Physician', '/search')}
                      >
                        Learn more about Physician Job opportunities
                      </Link>
                      <div className="dropdown-actions">
                        <Link
                          to="/search"
                          className="action-item"
                          onClick={() => handleNavClick('Search Jobs (menu)', '/search')}
                        >
                          <span className="action-icon">🔍</span>
                          <span>Search Jobs</span>
                        </Link>
                        <Link
                          to="/apply"
                          className="action-item"
                          onClick={() => handleNavClick('Apply (menu)', '/apply')}
                        >
                          <span className="action-icon">📝</span>
                          <span>Apply</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
            <li className="nav-item">
              <span className="nav-link">Hire Talent</span>
            </li>
            <li className="nav-item">
              <span className="nav-link">Talent Management</span>
            </li>
            <li className="nav-item">
              <span className="nav-link">Technology Solutions</span>
            </li>
            <li className="nav-item">
              <span className="nav-link">About Us</span>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
