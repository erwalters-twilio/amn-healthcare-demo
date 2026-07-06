import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { trackPage } from './utils/analytics';
import Header from './components/Header';
import ResetButton from './components/ResetButton';
import HomePage from './pages/HomePage';
import JobSearchPage from './pages/JobSearchPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplyLandingPage from './pages/ApplyLandingPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import DocumentUploadPage from './pages/DocumentUploadPage';

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageNames = {
      '/': 'Home',
      '/search': 'Job Search',
      '/job/167335': 'Job Detail',
      '/apply': 'Apply Landing',
      '/application': 'Application Form',
      '/documents': 'Document Upload',
    };

    const pageName = pageNames[location.pathname] || location.pathname;
    trackPage(pageName);
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <PageTracker />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<JobSearchPage />} />
        <Route path="/job/:id" element={<JobDetailPage />} />
        <Route path="/apply" element={<ApplyLandingPage />} />
        <Route path="/application" element={<ApplicationFormPage />} />
        <Route path="/documents" element={<DocumentUploadPage />} />
      </Routes>
      <ResetButton />
    </Router>
  );
}

export default App;
