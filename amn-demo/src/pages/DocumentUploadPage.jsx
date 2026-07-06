import { useLocation, useNavigate } from 'react-router-dom';
import { trackAbandonment } from '../utils/analytics';
import Button from '../components/Button';
import './DocumentUploadPage.css';

export default function DocumentUploadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || {};

  const handleSaveForLater = () => {
    // Fire the abandonment event to Segment
    trackAbandonment(formData);

    // Show confirmation message
    alert(
      `Thanks for starting your application!\n\nWe've saved your progress and sent a link to ${formData.email} so you can complete it anytime in the next 30 days.\n\n(In the demo, this fires the "Application Abandoned" event to Segment.)`
    );

    // Navigate back to home
    navigate('/');
  };

  return (
    <div className="document-upload-page">
      <div className="upload-decorative">
        <div className="upload-polaroid" style={{top: '5%', left: '3%', transform: 'rotate(-10deg)'}}>
          <div className="upload-polaroid-img" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}></div>
        </div>
        <div className="upload-polaroid" style={{top: '35%', left: '5%', transform: 'rotate(8deg)'}}>
          <div className="upload-polaroid-img" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}></div>
        </div>
      </div>
      <div className="upload-content">
        <div className="upload-card">
          <div className="upload-icon">📋</div>
          <h1>Great! Let's verify your credentials</h1>
          <p className="upload-subtitle">
            To complete your application, please upload the following documents.
            This helps us match you with the best opportunities.
          </p>
          <div className="upload-fields">
            <div className="upload-field">
              <label>
                Resume/CV <span className="required">*</span>
              </label>
              <div className="file-input-wrapper">
                <input type="file" id="resume" className="file-input" disabled />
                <label htmlFor="resume" className="file-label">
                  <span className="file-icon">📄</span>
                  <span>Choose File</span>
                </label>
                <span className="file-name">No file chosen</span>
              </div>
            </div>
            <div className="upload-field">
              <label>
                Nursing License <span className="required">*</span>
              </label>
              <div className="file-input-wrapper">
                <input type="file" id="license" className="file-input" disabled />
                <label htmlFor="license" className="file-label">
                  <span className="file-icon">📋</span>
                  <span>Choose File</span>
                </label>
                <span className="file-name">No file chosen</span>
              </div>
            </div>
            <div className="upload-field">
              <label>Certifications (ACLS, BLS, etc.)</label>
              <div className="file-input-wrapper">
                <input type="file" id="certs" className="file-input" disabled />
                <label htmlFor="certs" className="file-label">
                  <span className="file-icon">🎓</span>
                  <span>Choose File</span>
                </label>
                <span className="file-name">No file chosen</span>
              </div>
              <p className="field-hint">Optional - but helps us find better matches</p>
            </div>
          </div>
          <div className="upload-help">
            <div className="help-icon">💡</div>
            <p>
              <strong>Don't have your documents handy?</strong> No problem! Save your progress
              and we'll send you a link to complete your application whenever you're ready.
            </p>
          </div>
          <div className="upload-actions">
            <Button variant="primary" disabled fullWidth>
              Continue Application
            </Button>
            <Button variant="outline" onClick={handleSaveForLater} fullWidth>
              Save & Finish Later
            </Button>
          </div>
          <p className="required-note">* Indicates Required Fields</p>
        </div>
      </div>
      <div className="upload-decorative upload-decorative-right">
        <div className="upload-polaroid" style={{top: '10%', right: '4%', transform: 'rotate(12deg)'}}>
          <div className="upload-polaroid-img" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}></div>
        </div>
        <div className="upload-polaroid" style={{top: '45%', right: '6%', transform: 'rotate(-7deg)'}}>
          <div className="upload-polaroid-img" style={{background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'}}></div>
        </div>
      </div>
    </div>
  );
}
