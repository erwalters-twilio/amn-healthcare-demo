# Application Form Enhancements Design

**Date:** 2026-07-06  
**Status:** Approved

## Overview

Enhance the application form to capture city and zip code, send a Segment identify call with all form data when the user clicks "Apply Now", and make the documents page accessible standalone for demo purposes.

## Requirements

1. Add city and zip code fields to the application form (optional fields)
2. Send a Segment identify call with all form fields when "Apply Now" is clicked
3. Make the documents page render without errors when accessed directly (not from the form flow)

## Design

### 1. Form Fields & State

**File:** `amn-demo/src/pages/ApplicationFormPage.jsx`

Add two new fields to the form state:
- `city: ''` (string, optional)
- `zipCode: ''` (string, optional)

Add a new form row positioned after the firstName/lastName row and before the profession/discipline row. This row contains:
- **City field:** Text input, optional, standard input styling
- **Zip Code field:** Text input, optional, 5-digit pattern hint in placeholder

Both fields follow the existing form styling patterns with the same CSS classes as other inputs.

### 2. Segment Identify Call

**File:** `amn-demo/src/utils/analytics.js`

Create a new `trackIdentify()` function that:
- Takes `formData` object as parameter
- Uses email as the `userId` for the identify call
- Sends traits object containing: email, firstName, lastName, phone (normalized), profession, discipline, specialty, otherSpecialty, city, zipCode
- Includes timestamp data (timestamp, date, time, unix) in traits
- Uses the existing phone normalization logic
- Logs to console for debugging

**File:** `amn-demo/src/pages/ApplicationFormPage.jsx`

Update `handleSubmit` to call identify before navigation:
1. Check `agreedToTerms`
2. Call `trackClick()` (existing)
3. Call `trackIdentify(formData)` (new)
4. Navigate to `/documents` with formData in state

### 3. DocumentUploadPage Standalone Access

**File:** `amn-demo/src/pages/DocumentUploadPage.jsx`

Change is minimal - the existing code already uses:
```javascript
const formData = location.state?.formData || {};
```

This fallback to empty object ensures the page renders without errors when accessed directly. The "Save & Finish Later" button will reference undefined email in its alert if clicked in standalone mode, but this is acceptable for demo purposes where the button won't be used.

### 4. Data Flow

```
User fills form (including city/zip)
  ↓
Clicks "Apply Now"
  ↓
trackClick() fires → CTA Clicked event
  ↓
trackIdentify() fires → identify call with all form fields
  ↓
Navigate to /documents with formData
  ↓
DocumentUploadPage renders with formData OR standalone with empty object
```

### 5. Testing

Manual testing checklist:
- Fill out complete form with city and zip code
- Click "Apply Now"
- Verify Segment identify call fires in browser network tab
- Check Segment debugger for identify call with all expected traits
- Navigate directly to `/documents` URL
- Verify page loads without JavaScript errors in console
- Verify page renders with empty upload fields

## Implementation Notes

- Follow existing code patterns for consistency
- Use same CSS classes and styling as existing form fields
- Phone normalization logic already exists - reuse it
- No changes needed to routing or App.jsx
- No database or backend changes required

## Success Criteria

1. City and zip code fields appear on application form after name fields
2. Segment identify call fires when "Apply Now" is clicked
3. Identify call contains all form fields: email, firstName, lastName, phone, profession, discipline, specialty, otherSpecialty, city, zipCode
4. Documents page loads without errors when accessed via `/documents` URL directly
5. No console errors in either the form flow or standalone documents page access
