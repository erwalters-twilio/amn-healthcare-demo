import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackClick } from '../utils/analytics';
import Button from '../components/Button';
import './ApplicationFormPage.css';

export default function ApplicationFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromPrevious = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromPrevious,
    phone: '',
    firstName: '',
    lastName: '',
    city: '',
    zipCode: '',
    profession: '',
    discipline: '',
    specialty: '',
    otherSpecialty: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreedToTerms) {
      trackClick('Apply Now (form)', '/documents', '/application');
      navigate('/documents', { state: { formData } });
    }
  };

  return (
    <div className="application-form-page">
      <div className="form-decorative-images">
        <div className="form-polaroid" style={{top: '10%', left: '5%', transform: 'rotate(-8deg)'}}>
          <div className="form-polaroid-img" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}></div>
        </div>
        <div className="form-polaroid" style={{top: '40%', left: '2%', transform: 'rotate(5deg)'}}>
          <div className="form-polaroid-img" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}></div>
        </div>
        <div className="form-polaroid" style={{top: '70%', left: '7%', transform: 'rotate(-12deg)'}}>
          <div className="form-polaroid-img" style={{background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'}}></div>
        </div>
      </div>
      <div className="form-content">
        <div className="form-card">
          <h1>Application Form</h1>
          <p className="form-description">
            We're excited to help you find your next healthcare opportunity!
          </p>
          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-field">
                <label htmlFor="phone">
                  Phone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(###) ###-####"
                  required
                  className="input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="firstName">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-field">
                <label htmlFor="lastName">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="input"
                />
              </div>
              <div className="form-field">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="12345"
                  maxLength="5"
                  pattern="[0-9]{5}"
                  className="input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="profession">
                  Profession <span className="required">*</span>
                </label>
                <select
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select...</option>
                  <option value="Nursing">Nursing</option>
                  <option value="Allied Health">Allied Health</option>
                  <option value="Physician">Physician</option>
                  <option value="Advanced Practice">Advanced Practice</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="discipline">
                  Discipline <span className="required">*</span>
                </label>
                <select
                  id="discipline"
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select...</option>
                  <option value="Registered Nurse">Registered Nurse</option>
                  <option value="Licensed Practical Nurse">Licensed Practical Nurse</option>
                  <option value="Nurse Practitioner">Nurse Practitioner</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="specialty">
                  Specialty <span className="required">*</span>
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select...</option>
                  <option value="NICU">Neonatal Intensive Care (NICU)</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="ER">Emergency Room (ER)</option>
                  <option value="Med-Surg">Medical-Surgical</option>
                  <option value="Telemetry">Telemetry</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="otherSpecialty">Other Specialty</label>
                <select
                  id="otherSpecialty"
                  name="otherSpecialty"
                  value={formData.otherSpecialty}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select...</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Labor & Delivery">Labor & Delivery</option>
                  <option value="OR">Operating Room</option>
                </select>
              </div>
            </div>
            <div className="form-consent">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                <span className="consent-text">
                  I agree to receive emails, automated text messages and phone calls (including calls
                  that contain prerecorded content) from and on behalf of AMN Healthcare, and affiliates.
                  I understand these messages will be to the email or phone number provided, and will be
                  about employment opportunities, positions in which I've been placed, and my employment
                  with AMN companies. See{' '}
                  <a href="#" className="consent-link">privacy policy</a> or{' '}
                  <a href="#" className="consent-link">cookie policy</a> for more details.
                </span>
              </label>
            </div>
            <p className="required-note">* Indicates Required Fields</p>
            <Button type="submit" variant="primary" fullWidth disabled={!agreedToTerms}>
              Apply Now!
            </Button>
          </form>
        </div>
      </div>
      <div className="form-decorative-images form-decorative-right">
        <div className="form-polaroid" style={{top: '15%', right: '5%', transform: 'rotate(10deg)'}}>
          <div className="form-polaroid-img" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}></div>
        </div>
        <div className="form-polaroid" style={{top: '50%', right: '3%', transform: 'rotate(-6deg)'}}>
          <div className="form-polaroid-img" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}></div>
        </div>
        <div className="form-polaroid" style={{top: '75%', right: '8%', transform: 'rotate(12deg)'}}>
          <div className="form-polaroid-img" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}></div>
        </div>
      </div>
    </div>
  );
}
