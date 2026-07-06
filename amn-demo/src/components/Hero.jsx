import { Link } from 'react-router-dom';
import { trackClick } from '../utils/analytics';
import Button from './Button';
import './Hero.css';

export default function Hero() {
  const handleCTAClick = (buttonText, destination) => {
    trackClick(buttonText, destination, '/');
  };

  return (
    <div className="hero">
      <div className="hero-background">
        <img src="/hero-image.png" alt="Healthcare team" />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          Empowering Healthcare Careers, and the Teams Behind Them
        </h1>
        <div className="hero-buttons">
          <Link to="/search" onClick={() => handleCTAClick('Search Jobs (hero)', '/search')}>
            <Button variant="secondary">Search Jobs</Button>
          </Link>
          <Button variant="secondary">Employer Solutions</Button>
        </div>
      </div>
    </div>
  );
}
