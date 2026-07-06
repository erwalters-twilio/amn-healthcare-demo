import { AnalyticsBrowser } from '@segment/analytics-next';

let analytics = null;

// Format timestamp for easy sorting and filtering
const getTimestampData = () => {
  const now = new Date();
  return {
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0], // YYYY-MM-DD format
    time: now.toISOString().split('T')[1].split('.')[0], // HH:MM:SS format
    unix: Math.floor(now.getTime() / 1000), // Unix timestamp in seconds
  };
};

export const initAnalytics = () => {
  const writeKey = import.meta.env.VITE_SEGMENT_WRITE_KEY;

  if (!writeKey) {
    console.warn('Segment write key not found. Analytics will not be tracked.');
    return null;
  }

  analytics = AnalyticsBrowser.load({ writeKey });
  console.log('Segment Analytics initialized');

  return analytics;
};

export const trackPage = (pageName, properties = {}) => {
  if (!analytics) {
    console.log('[Analytics Debug] Page:', pageName, properties);
    return;
  }

  const timestampData = getTimestampData();

  analytics.page(pageName, {
    page_name: pageName,
    page_path: window.location.pathname,
    ...timestampData,
    ...properties,
  });

  console.log('[Segment] Page tracked:', pageName);
};

export const trackClick = (buttonText, destination, sourcePage) => {
  if (!analytics) {
    console.log('[Analytics Debug] Click:', { buttonText, destination, sourcePage });
    return;
  }

  const timestampData = getTimestampData();

  analytics.track('CTA Clicked', {
    button_text: buttonText,
    destination,
    source_page: sourcePage,
    ...timestampData,
  });

  console.log('[Segment] CTA Clicked:', buttonText);
};

// Normalize phone number to E.164 format (+11234567890)
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Add +1 country code if not present (assuming US numbers)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Return as-is with + prefix if already formatted
  return `+${digits}`;
};

// Generate a unique application ID for each abandonment
// Format: app_TIMESTAMP_RANDOM_COUNTER
// This ensures uniqueness even if same user abandons multiple times
let abandonmentCounter = 0;
const generateApplicationId = () => {
  abandonmentCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `app_${timestamp}_${random}_${abandonmentCounter}`;
};

export const trackAbandonment = (formData) => {
  if (!analytics) {
    console.log('[Analytics Debug] Application Abandoned:', formData);
    return;
  }

  const applicationId = generateApplicationId();
  const normalizedPhone = normalizePhoneNumber(formData.phone);
  const timestampData = getTimestampData();

  analytics.track('Application Abandoned', {
    application_id: applicationId, // FIRST - primary key for Segment journeys
    abandonment_step: 'document_upload',
    email: formData.email,
    phone: normalizedPhone,
    firstName: formData.firstName,
    lastName: formData.lastName,
    profession: formData.profession,
    discipline: formData.discipline,
    specialty: formData.specialty,
    ...timestampData,
  });

  // Also identify the user
  if (formData.email) {
    analytics.identify(formData.email, {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: normalizedPhone,
    });
  }

  console.log('[Segment] Application Abandoned event sent:', applicationId);
  console.log('[Segment] Phone normalized:', formData.phone, '→', normalizedPhone);
};

export const getAnalytics = () => analytics;
