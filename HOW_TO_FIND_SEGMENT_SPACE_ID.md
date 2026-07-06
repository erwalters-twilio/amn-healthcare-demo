# How to Find Your Segment Space ID

The Segment Profile API needs your **Space ID** (not workspace slug).

## Method 1: Via Segment Settings (Easiest)

1. Go to [Segment](https://app.segment.com)
2. Click **Settings** (gear icon in left sidebar)
3. Click **Workspace Settings** → **General**
4. Look for **"Space ID"**
5. It looks like: `spa_xxxxxxxxxxxxx`

## Method 2: Via API Token Page

1. Go to [Segment](https://app.segment.com)
2. Click **Settings** → **Access Management** → **Tokens**
3. When you create a Profile API token, it shows the Space ID
4. Copy the Space ID that appears

## Method 3: Via Profile API Test

1. Go to [Segment Profile API Docs](https://segment.com/docs/profiles/profile-api/)
2. Click "Try it" on any endpoint
3. The Space ID is pre-filled in the request URL

## Method 4: Via URL

Sometimes you can see it in your Segment URL:
- Look at the URL when viewing Sources or Destinations
- Format: `https://app.segment.com/{workspace_slug}/sources/...`
- The Space ID is NOT in the URL, use Method 1 instead

## Example

**Correct Space ID format**: `spa_2Xj9k3mNqP8rT4sL6vH`

**NOT the workspace slug**: `my-company-prod` ❌

## What You Need for the Relay Server

In your `.env` file:

```bash
# This is what you need:
SEGMENT_SPACE_ID=spa_xxxxxxxxxxxxx

# NOT this (workspace slug):
SEGMENT_WORKSPACE_SLUG=my-company-prod  ❌
```

## Testing Your Space ID

Once you have it, test the API:

```bash
curl "https://profiles.segment.com/v1/spaces/spa_xxxxxxxxxxxxx/collections/users/profiles/phone:+15555555555" \
  -H "Authorization: Basic $(echo -n 'YOUR_PROFILE_TOKEN:' | base64)"
```

If it works, you'll see profile data. If not, check:
- Space ID is correct format (`spa_...`)
- Profile API token has read permissions
- Phone number exists in Segment (check Debugger)
