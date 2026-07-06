# Application Form Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add city and zip code fields to the application form, send a Segment identify call with all form data when "Apply Now" is clicked, and ensure the documents page renders standalone without errors.

**Architecture:** Extend existing form state with two new optional fields (city, zipCode), add a new analytics function to send Segment identify calls, and ensure DocumentUploadPage handles missing formData gracefully.

**Tech Stack:** React, React Router, Segment Analytics (@segment/analytics-next)

## Global Constraints

- Follow existing form styling patterns and CSS classes
- Reuse existing phone normalization logic from analytics.js
- No changes to routing or App.jsx
- No backend/database changes
- All fields except city/zipCode already exist and are working

---

### Task 1: Add trackIdentify function to analytics

**Files:**
- Modify: `amn-demo/src/utils/analytics.js:133` (add new function after trackAbandonment)

**Interfaces:**
- Consumes: analytics instance, normalizePhoneNumber function, getTimestampData function
- Produces: `trackIdentify(formData)` - takes formData object with {email, firstName, lastName, phone, profession, discipline, specialty, otherSpecialty, city, zipCode}, sends Segment identify call with email as userId

- [ ] **Step 1: Write the trackIdentify function**

Add this function at the end of `amn-demo/src/utils/analytics.js` (after line 132):

```javascript
export const trackIdentify = (formData) => {
  if (!analytics) {
    console.log('[Analytics Debug] Identify:', formData);
    return;
  }

  const normalizedPhone = normalizePhoneNumber(formData.phone);
  const timestampData = getTimestampData();

  analytics.identify(formData.email, {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: normalizedPhone,
    profession: formData.profession,
    discipline: formData.discipline,
    specialty: formData.specialty,
    otherSpecialty: formData.otherSpecialty,
    city: formData.city,
    zipCode: formData.zipCode,
    ...timestampData,
  });

  console.log('[Segment] Identify call sent for:', formData.email);
};
```

- [ ] **Step 2: Verify the function is exported**

Check that the export statement is added at the end of the file. The function should be available for import in other files.

- [ ] **Step 3: Commit the analytics function**

```bash
git add amn-demo/src/utils/analytics.js
git commit -m "feat: add trackIdentify function for Segment identify calls

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Add city and zipCode to form state and UI

**Files:**
- Modify: `amn-demo/src/pages/ApplicationFormPage.jsx:12-21` (add to formData state)
- Modify: `amn-demo/src/pages/ApplicationFormPage.jsx:118` (add new form row after lastName row)

**Interfaces:**
- Consumes: existing form state pattern, handleChange function
- Produces: formData object now includes city and zipCode fields

- [ ] **Step 1: Add city and zipCode to form state**

In `amn-demo/src/pages/ApplicationFormPage.jsx`, update the formData useState (lines 12-21) to include the new fields:

```javascript
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
```

- [ ] **Step 2: Add the city and zipCode form row**

After the lastName form row (after line 117), add this new form row:

```javascript
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
```

- [ ] **Step 3: Verify the form renders without errors**

Run the dev server and navigate to `/application`. Check that:
- City and Zip Code fields appear after First Name/Last Name
- Fields are optional (no red asterisk)
- Fields accept input and update state
- Existing fields still work correctly

Run: `npm run dev` (from amn-demo directory)
Navigate to: `http://localhost:5173/application`

- [ ] **Step 4: Commit the form field changes**

```bash
git add amn-demo/src/pages/ApplicationFormPage.jsx
git commit -m "feat: add city and zipCode fields to application form

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Call trackIdentify on form submission

**Files:**
- Modify: `amn-demo/src/pages/ApplicationFormPage.jsx:3` (add import)
- Modify: `amn-demo/src/pages/ApplicationFormPage.jsx:30-36` (update handleSubmit)

**Interfaces:**
- Consumes: `trackIdentify(formData)` from analytics.js, existing formData state
- Produces: Segment identify call fired before navigation to /documents

- [ ] **Step 1: Import trackIdentify function**

Update the import statement at line 3 in `amn-demo/src/pages/ApplicationFormPage.jsx`:

```javascript
import { trackClick, trackIdentify } from '../utils/analytics';
```

- [ ] **Step 2: Update handleSubmit to call trackIdentify**

Replace the handleSubmit function (lines 30-36) with:

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (agreedToTerms) {
    trackClick('Apply Now (form)', '/documents', '/application');
    trackIdentify(formData);
    navigate('/documents', { state: { formData } });
  }
};
```

- [ ] **Step 3: Test the identify call in browser**

Run the dev server, fill out the form completely including city and zip code, check the browser console and network tab:
- Fill all fields including city and zip code
- Click "Apply Now"
- Check browser console for: `[Segment] Identify call sent for: <email>`
- Check Network tab for Segment API call with identify payload
- Verify payload includes all fields: email, firstName, lastName, phone, profession, discipline, specialty, otherSpecialty, city, zipCode

Run: `npm run dev` (from amn-demo directory)
Navigate to: `http://localhost:5173/application`

Expected console output: `[Segment] Identify call sent for: test@example.com`

- [ ] **Step 4: Commit the identify call integration**

```bash
git add amn-demo/src/pages/ApplicationFormPage.jsx
git commit -m "feat: send Segment identify call on Apply Now submission

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Verify DocumentUploadPage standalone access

**Files:**
- Verify: `amn-demo/src/pages/DocumentUploadPage.jsx:9` (no changes needed)

**Interfaces:**
- Consumes: location.state?.formData with fallback to empty object
- Produces: Page renders without errors when accessed standalone

- [ ] **Step 1: Verify the fallback is in place**

Check that line 9 in `amn-demo/src/pages/DocumentUploadPage.jsx` contains:

```javascript
const formData = location.state?.formData || {};
```

This line should already exist. No changes needed.

- [ ] **Step 2: Test standalone access in browser**

Navigate directly to the documents page without going through the form:
- Navigate to: `http://localhost:5173/documents`
- Verify page loads without JavaScript errors in console
- Verify upload fields render correctly
- Verify no console errors about missing formData

Run: `npm run dev` (from amn-demo directory)
Navigate directly to: `http://localhost:5173/documents`

Expected: Page loads successfully with empty upload form, no console errors

- [ ] **Step 3: Test normal flow still works**

Go through the complete flow to ensure nothing broke:
- Navigate to: `http://localhost:5173/application`
- Fill out form including city and zip code
- Click "Apply Now"
- Verify navigation to documents page works
- Verify formData is still passed correctly

Expected: Complete flow works as before, identify call fires

- [ ] **Step 4: Document verification complete**

No commit needed for this task (verification only). Add a comment to the pull request or commit message of the next commit noting that standalone documents access was verified.

---

### Task 5: Final integration testing

**Files:**
- Test: All modified files integrated together

**Interfaces:**
- Consumes: All previous tasks
- Produces: Fully working feature meeting all spec requirements

- [ ] **Step 1: Test complete form submission flow**

Full end-to-end test:
1. Navigate to `/application`
2. Fill out all fields including city: "San Diego" and zipCode: "92101"
3. Agree to terms
4. Click "Apply Now"
5. Verify console shows both trackClick and trackIdentify logs
6. Verify navigation to `/documents` works
7. Verify documents page receives formData

Expected output in console:
```
[Segment] CTA Clicked: Apply Now (form)
[Segment] Identify call sent for: test@example.com
```

- [ ] **Step 2: Test standalone documents access**

1. Open new browser tab
2. Navigate directly to `http://localhost:5173/documents`
3. Verify page loads without errors
4. Verify no console errors
5. Check that upload UI renders correctly

Expected: Clean page load with no JavaScript errors

- [ ] **Step 3: Verify Segment debugger shows identify call**

1. Log into Segment workspace
2. Open Segment Debugger
3. Submit a form with test data
4. Check debugger for identify call
5. Verify all traits are present: email, firstName, lastName, phone, profession, discipline, specialty, otherSpecialty, city, zipCode, timestamp data

Expected: Identify event appears in Segment debugger with all fields

- [ ] **Step 4: Test edge cases**

Test optional field behavior:
1. Submit form with city but no zip code
2. Submit form with zip code but no city
3. Submit form with neither city nor zip code
4. Verify identify call sends empty strings for blank fields
5. Verify no JavaScript errors in any case

Expected: All cases work correctly, empty fields send as empty strings

- [ ] **Step 5: Final commit and summary**

```bash
git log --oneline -5
```

Verify all commits are in place:
1. feat: add trackIdentify function for Segment identify calls
2. feat: add city and zipCode fields to application form
3. feat: send Segment identify call on Apply Now submission

Expected: 3 new commits with clear messages

---

## Success Criteria Checklist

After completing all tasks, verify these requirements from the spec:

- [ ] City and zip code fields appear on application form after name fields
- [ ] Fields are optional (no required asterisk)
- [ ] Segment identify call fires when "Apply Now" is clicked
- [ ] Identify call contains all form fields: email, firstName, lastName, phone, profession, discipline, specialty, otherSpecialty, city, zipCode
- [ ] Identify call uses email as userId
- [ ] Documents page loads without errors when accessed via `/documents` URL directly
- [ ] No console errors in either the form flow or standalone documents page access
- [ ] Phone number is normalized in identify call
- [ ] Timestamp data is included in identify call traits

## Notes

- The DocumentUploadPage already has the correct fallback pattern, so no code changes are needed for Task 4
- The "Save & Finish Later" button will show undefined email in the alert if clicked in standalone mode, but this is acceptable for demo purposes
- All new fields follow existing patterns for consistency
- Phone normalization and timestamp data are handled by existing utility functions
