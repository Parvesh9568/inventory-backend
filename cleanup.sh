#!/bin/bash

# Backend Cleanup Script
# This script removes all unused files from the backend

echo "🧹 Starting Backend Cleanup..."
echo ""

# Confirm before proceeding
read -p "This will delete unused files. Have you backed up your code? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "❌ Cleanup cancelled. Please backup your code first!"
    exit 1
fi

echo ""
echo "📋 Deleting unused files..."
echo ""

# Delete test files
test_files=(
    "workingServer.js"
    "testConnection.js"
    "testAPI.js"
    "test-vendor-delete.js"
    "test-vendor-creation.js"
    "test-user.js"
    "test-simple.js"
    "test-server.js"
    "test-payment-storage.js"
    "simpleTest.js"
    "quickTest.js"
    "addData.js"
    "seed-sample-data.js"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "✅ Deleted: $file"
    else
        echo "⚠️  Not found: $file"
    fi
done

# Delete scripts folder
if [ -d "scripts" ]; then
    rm -rf "scripts"
    echo "✅ Deleted: scripts/ folder"
else
    echo "⚠️  Not found: scripts/ folder"
fi

# Delete unused routes
unused_routes=(
    "routes/config.js"
    "routes/users.js"
)

for route in "${unused_routes[@]}"; do
    if [ -f "$route" ]; then
        rm "$route"
        echo "✅ Deleted: $route"
    else
        echo "⚠️  Not found: $route"
    fi
done

# Delete unused models
unused_models=(
    "models/User.js"
    "models/Payment.js"
    "models/VendorItemPrice.js"
)

for model in "${unused_models[@]}"; do
    if [ -f "$model" ]; then
        rm "$model"
        echo "✅ Deleted: $model"
    else
        echo "⚠️  Not found: $model"
    fi
done

echo ""
echo "🎉 Cleanup Complete!"
echo ""
echo "📊 Summary:"
echo "  - Deleted 13 test files"
echo "  - Deleted scripts/ folder"
echo "  - Deleted 2 unused routes"
echo "  - Deleted 3 unused models"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Test your application: npm start"
echo "  2. Verify all features work"
echo "  3. Check for any errors"
echo "  4. Commit changes: git add . && git commit -m 'Clean up unused files'"
echo ""
echo "✅ Backend is now clean and optimized!"
