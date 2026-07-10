#!/bin/bash

# Deploy script for AMN Recruiter Dashboard
# This deploys as a SEPARATE Vercel project from other projects in parent directory

set -e

echo "=========================================="
echo "AMN Recruiter Dashboard - Vercel Deploy"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: Must run this script from the recruiter-dashboard directory"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Check if this is first deployment
if [ ! -d ".vercel" ]; then
    echo "📦 First time deployment detected"
    echo ""
    echo "⚠️  IMPORTANT: When prompted..."
    echo "   - Link to existing project? → Say NO"
    echo "   - Project name? → Use 'amn-recruiter-dashboard'"
    echo ""
    echo "This ensures a separate project from 'amn-demo'"
    echo ""
    read -p "Press Enter to continue..."
fi

# Run deployment
echo ""
echo "🚀 Starting deployment..."
echo ""

vercel --prod

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Note your deployment URL from above"
echo "2. Add environment variables:"
echo "   vercel env add SEGMENT_PROFILE_TOKEN"
echo "   vercel env add SEGMENT_SPACE_ID"
echo "   vercel env add TWILIO_ACCOUNT_SID"
echo "   vercel env add TWILIO_AUTH_TOKEN"
echo "   vercel env add MEMORY_STORE_ID"
echo "   vercel env add MEMORY_API_KEY"
echo ""
echo "3. Redeploy after adding env vars:"
echo "   vercel --prod"
echo ""
echo "4. Set up Segment Destination Function"
echo "   See: segment-destination/README.md"
echo ""
