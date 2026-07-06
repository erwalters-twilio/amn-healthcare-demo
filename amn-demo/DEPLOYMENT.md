# Deployment Guide - AMN Healthcare Demo

## Option 1: Vercel (Recommended - FREE & 2 Minutes)

### Why Vercel?
- ✅ **Free forever** for personal/demo projects
- ✅ **Automatic HTTPS**
- ✅ **Global CDN** (fast worldwide)
- ✅ **Environment variables** (for Segment key)
- ✅ **Auto-deploys** on git push
- ✅ **Custom domains** (optional)

### Steps:

#### 1. Install Vercel CLI (one-time)

```bash
npm install -g vercel
```

#### 2. Deploy from your project directory

```bash
cd /Users/ericwalters/Documents/clients/amn-new/amn-demo
vercel
```

#### 3. Answer the prompts:

```
? Set up and deploy "~/Documents/clients/amn-new/amn-demo"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? amn-demo
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

#### 4. Add your Segment Write Key as environment variable:

```bash
vercel env add VITE_SEGMENT_WRITE_KEY
```

When prompted:
- **Value**: Paste your Segment write key
- **Environment**: Select "Production, Preview, and Development"

#### 5. Redeploy with the environment variable:

```bash
vercel --prod
```

**Done!** You'll get a URL like: `https://amn-demo-abc123.vercel.app`

### Share with Coworkers:

Just send them the Vercel URL - they can access it immediately, no login required.

### Future Updates:

Just run `vercel --prod` again to deploy changes.

---

## Option 2: Netlify (Also FREE)

### Steps:

#### 1. Create a `netlify.toml` file:

```bash
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
```

#### 2. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

#### 3. Deploy:

```bash
netlify deploy --prod
```

#### 4. Add environment variable in Netlify dashboard:

- Go to: Site Settings → Environment Variables
- Add: `VITE_SEGMENT_WRITE_KEY` = your_segment_key

---

## Option 3: GitHub Pages (FREE but more setup)

### Steps:

#### 1. Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/amn-demo/', // Replace with your repo name
})
```

#### 2. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

#### 3. Add deploy script to `package.json`:

```json
"scripts": {
  "deploy": "vite build && gh-pages -d dist"
}
```

#### 4. Deploy:

```bash
npm run deploy
```

**Note**: GitHub Pages doesn't support environment variables well, so you'd need to hardcode the Segment key (not ideal for security).

---

## Option 4: Cloudflare Pages (FREE)

Similar to Vercel/Netlify but with Cloudflare's global network.

```bash
npm install -g wrangler
wrangler pages publish dist --project-name=amn-demo
```

---

## Comparison:

| Option | Cost | Speed | Ease | Env Vars | Custom Domain |
|--------|------|-------|------|----------|---------------|
| **Vercel** | FREE | ⚡⚡⚡ | 🟢 Easiest | ✅ | ✅ |
| **Netlify** | FREE | ⚡⚡⚡ | 🟢 Easy | ✅ | ✅ |
| **GitHub Pages** | FREE | ⚡⚡ | 🟡 Medium | ❌ | ✅ |
| **Cloudflare Pages** | FREE | ⚡⚡⚡ | 🟡 Medium | ✅ | ✅ |

---

## My Recommendation:

**Go with Vercel** - literally 2 commands:

```bash
npm install -g vercel
vercel
```

Then add your Segment key:

```bash
vercel env add VITE_SEGMENT_WRITE_KEY
vercel --prod
```

Share the URL with your team and you're done! 🚀

---

## Troubleshooting:

### Routes not working (404 on refresh)?
- Vercel: Already handled by `vercel.json` ✅
- Netlify: Add `_redirects` file or `netlify.toml`
- GitHub Pages: Use hash routing instead

### Environment variable not working?
- Make sure it starts with `VITE_` prefix
- Redeploy after adding env vars
- Check build logs for errors

### Build failing?
```bash
# Test build locally first:
npm run build

# Preview the build:
npm run preview
```

### Need to update deployment?
```bash
# Make changes, then:
vercel --prod
```
