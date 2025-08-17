#!/bin/bash

echo "🚀 Starting user creation process..."
echo "📁 Current directory: $(pwd)"
echo "📋 User details:"
echo "   Email: nhatcuongboy@gmail.com"
echo "   Name: Nhật Cường"
echo "   Role: HOST"
echo "   Password: Rambolun@69"
echo ""

echo "🔄 Running user creation script..."
node scripts/create-user.js

echo ""
echo "📊 Listing all users in database..."
node scripts/list-users.js

echo ""
echo "✅ Process completed!"
