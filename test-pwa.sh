#!/bin/bash

# PWA Testing Script for Badminton App

echo "🏸 Badminton App PWA Testing Script"
echo "=================================="

# Check if build files exist
echo "📋 Checking PWA files..."

if [ -f "public/manifest.json" ]; then
    echo "✅ manifest.json exists"
else
    echo "❌ manifest.json missing"
fi

if [ -f "public/sw.js" ]; then
    echo "✅ Custom service worker exists"
else
    echo "❌ Custom service worker missing"
fi

if [ -f "public/workbox-"*".js" ]; then
    echo "✅ Workbox service worker generated"
else
    echo "❌ Workbox service worker not found"
fi

if [ -d "public/icons" ]; then
    icon_count=$(ls public/icons/*.png 2>/dev/null | wc -l)
    echo "✅ Icons directory exists with $icon_count PNG files"
else
    echo "❌ Icons directory missing"
fi

echo ""
echo "🚀 Starting production server..."
echo "Visit http://localhost:3000 and check:"
echo "1. Browser install prompt appears"
echo "2. App works offline after initial load"
echo "3. Lighthouse PWA score"
echo "4. Application tab in DevTools shows manifest and service worker"

echo ""
echo "Press Ctrl+C to stop the server when done testing"
echo ""

# Start production server
npm start
