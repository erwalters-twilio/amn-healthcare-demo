import { Link } from 'react-router-dom';
import { trackClick } from '../utils/analytics';
import Hero from '../components/Hero';
import Button from '../components/Button';
import './HomePage.css';

export default function HomePage() {
  const handleTileClick = (tileName, destination) => {
    trackClick(`Tile: ${tileName}`, destination, '/');
  };

  return (
    <div className="home-page">
      <Hero />
      <section className="services-section">
        <div className="container">
          <div className="services-grid">
            <div className="service-tile">
              <div className="service-icon">💻</div>
              <h3>Workforce Technology</h3>
              <p>Advanced tools to manage and optimize your healthcare workforce</p>
            </div>
            <div className="service-tile">
              <div className="service-icon">👥</div>
              <h3>Comprehensive Staffing</h3>
              <p>Complete staffing solutions for healthcare organizations</p>
            </div>
            <div className="service-tile">
              <div className="service-icon">📊</div>
              <h3>Strategic Management</h3>
              <p>Expert guidance to streamline your workforce operations</p>
            </div>
            <Link
              to="/search"
              className="service-tile service-tile-cta"
              onClick={() => handleTileClick('Search Jobs', '/search')}
            >
              <div className="service-icon">🔍</div>
              <h3>Search Jobs</h3>
              <p>Find your next healthcare opportunity today</p>
            </Link>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of healthcare professionals who trust AMN Healthcare</p>
          <Link to="/search" onClick={() => handleTileClick('Get Started', '/search')}>
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
