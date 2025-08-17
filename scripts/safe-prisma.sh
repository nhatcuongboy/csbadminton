#!/bin/bash

# Safe Prisma Commands - Prevents accidental data loss
# Add this to your .bashrc or .zshrc:
# alias prisma-reset='./scripts/safe-prisma.sh reset'
# alias prisma-push='./scripts/safe-prisma.sh push'

COMMAND=$1

case $COMMAND in
    "reset")
        echo "⚠️  WARNING: You are about to run 'prisma db push --force-reset'"
        echo "🚨 This will DELETE ALL DATA in your database!"
        echo ""
        echo "Current environment:"
        echo "DATABASE_URL: $(echo $DATABASE_URL | sed 's/:[^@]*@/:***@/')"
        echo ""
        echo "🛡️  Recommended: Create a backup first:"
        echo "   ./scripts/backup-database.sh"
        echo ""
        read -p "Type 'DELETE ALL DATA' to confirm: " confirm
        
        if [ "$confirm" = "DELETE ALL DATA" ]; then
            echo "Creating emergency backup first..."
            ./scripts/backup-database.sh
            echo "Proceeding with reset..."
            npx prisma db push --force-reset --accept-data-loss
        else
            echo "❌ Reset cancelled - good choice!"
        fi
        ;;
    
    "push")
        echo "🔍 Running safe db push..."
        echo "Current environment:"
        echo "DATABASE_URL: $(echo $DATABASE_URL | sed 's/:[^@]*@/:***@/')"
        echo ""
        read -p "Continue with db push? (y/N): " confirm
        
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            npx prisma db push
        else
            echo "❌ Push cancelled"
        fi
        ;;
        
    *)
        echo "Usage: $0 [reset|push]"
        echo ""
        echo "Commands:"
        echo "  reset - Safely reset database (with backup)"
        echo "  push  - Safely push schema changes"
        ;;
esac
