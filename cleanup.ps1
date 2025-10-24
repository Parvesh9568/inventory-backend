# Backend Cleanup Script
# This script removes all unused files from the backend

Write-Host "🧹 Starting Backend Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Confirm before proceeding
$confirmation = Read-Host "This will delete unused files. Have you backed up your code? (yes/no)"
if ($confirmation -ne 'yes') {
    Write-Host "❌ Cleanup cancelled. Please backup your code first!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📋 Deleting unused files..." -ForegroundColor Yellow
Write-Host ""

# Delete test files
$testFiles = @(
    "workingServer.js",
    "testConnection.js",
    "testAPI.js",
    "test-vendor-delete.js",
    "test-vendor-creation.js",
    "test-user.js",
    "test-simple.js",
    "test-server.js",
    "test-payment-storage.js",
    "simpleTest.js",
    "quickTest.js",
    "addData.js",
    "seed-sample-data.js"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

# Delete scripts folder
if (Test-Path "scripts") {
    Remove-Item "scripts" -Recurse -Force
    Write-Host "✅ Deleted: scripts/ folder" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not found: scripts/ folder" -ForegroundColor Yellow
}

# Delete unused routes
$unusedRoutes = @(
    "routes\config.js",
    "routes\users.js"
)

foreach ($route in $unusedRoutes) {
    if (Test-Path $route) {
        Remove-Item $route -Force
        Write-Host "✅ Deleted: $route" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not found: $route" -ForegroundColor Yellow
    }
}

# Delete unused models
$unusedModels = @(
    "models\User.js",
    "models\Payment.js",
    "models\VendorItemPrice.js"
)

foreach ($model in $unusedModels) {
    if (Test-Path $model) {
        Remove-Item $model -Force
        Write-Host "✅ Deleted: $model" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not found: $model" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  - Deleted 13 test files"
Write-Host "  - Deleted scripts/ folder"
Write-Host "  - Deleted 2 unused routes"
Write-Host "  - Deleted 3 unused models"
Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test your application: npm start"
Write-Host "  2. Verify all features work"
Write-Host "  3. Check for any errors"
Write-Host "  4. Commit changes: git add . && git commit -m 'Clean up unused files'"
Write-Host ""
Write-Host "✅ Backend is now clean and optimized!" -ForegroundColor Green
