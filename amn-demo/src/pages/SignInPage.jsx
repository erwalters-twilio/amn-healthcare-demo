import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../utils/analytics';
import './SignInPage.css';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    signIn(email);
    navigate('/');
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <Link to="/">
          <img src="/amn-logo.jpeg" alt="AMN Healthcare" className="signin-logo" />
        </Link>
        <h1 className="signin-title">Sign In</h1>
        <p className="signin-subtitle">Access your AMN Healthcare account</p>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          <div className="signin-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="signin-error">{error}</p>}

          <button type="submit" className="signin-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
}
