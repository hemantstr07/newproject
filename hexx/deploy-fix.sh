#!/bin/bash

echo "🚀 Deploying Payment & Membership Fixes"
echo "========================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install git first."
    exit 1
fi

echo "✅ Git found"
echo ""

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Fix: Payment and membership systems

- Created /razorpay/create-order endpoint
- Created /payments/record endpoint  
- Simplified membership (no transactions table)
- Updated wrangler.toml with database ID
- Fixed all frontend API calls"

# Push
echo "🚀 Pushing to Cloudflare..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "⏰ Wait 2-3 minutes for Cloudflare to deploy"
echo ""
echo "🔧 IMPORTANT: Configure D1 Binding in Cloudflare Dashboard"
echo "   1. Go to: Cloudflare Dashboard → Pages → narmadasales"
echo "   2. Settings → Functions → D1 database bindings"
echo "   3. Add binding: Variable name = DB, Database = narmadasales-db"
echo "   4. Save and retry deployment"
echo ""
echo "🧪 Test after deployment:"
echo "   Visit: https://narmadasales.pages.dev/test-db"
echo ""
echo "📖 See PAYMENT_FIX_COMPLETE.md for detailed instructions"
