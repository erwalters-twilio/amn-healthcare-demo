import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackClick } from '../utils/analytics';
import Button from '../components/Button';
import './ApplyLandingPage.css';

export default function ApplyLandingPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      trackClick('Get Started', '/application', '/apply');
      navigate('/application', { state: { email } });
    }
  };

  return (
    <div className="apply-landing-page">
      <div className="apply-content">
        <div className="decorative-images">
          <div className="image-card image-card-1">
            <div className="polaroid">
              <div className="polaroid-image" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}></div>
              <div className="polaroid-label">Your Adventure</div>
            </div>
          </div>
          <div className="image-card image-card-2">
            <div className="polaroid">
              <div className="polaroid-image" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}></div>
              <div className="polaroid-label">New Horizons</div>
            </div>
          </div>
        </div>
        <div className="apply-form-container">
          <h1>It's Time to Take Your Career to the Next Level</h1>
          <p className="subtitle">
            No matter where you want to go, we have opportunities in locations across the country.
          </p>
          <form onSubmit={handleSubmit} className="apply-form">
            <p className="form-intro">Take the first step to starting your new career.</p>
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                className="form-input"
              />
            </div>
            <Button type="submit" variant="primary" fullWidth>
              Get Started
            </Button>
          </form>
        </div>
        <div className="decorative-images decorative-images-right">
          <div className="image-card image-card-3">
            <div className="polaroid">
              <div className="polaroid-image" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}></div>
              <div className="polaroid-label">Beach Life</div>
            </div>
          </div>
          <div className="image-card image-card-4">
            <div className="polaroid">
              <div className="polaroid-image" style={{background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'}}></div>
              <div className="polaroid-label">City Views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
