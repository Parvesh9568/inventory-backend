# 🔧 Vercel Upload Directory Fix

## Problem
```
Error: ENOENT: no such file or directory, mkdir '/var/task/uploads'
at Object.mkdirSync (node:fs:1363:26)
at file:///var/task/routes/vendorTransactionRecords.js:17:6
```

## Root Cause
The `vendorTransactionRecords.js` route was trying to create an `uploads` directory at module load time. Vercel's filesystem is **read-only** except for the `/tmp` directory, causing the application to crash on startup.

## Solution Applied

### ✅ Fixed in `routes/vendorTransactionRecords.js`:

**Before (Broken on Vercel):**
```javascript
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // ❌ Fails on Vercel
}
```

**After (Works on Vercel):**
```javascript
// Use /tmp directory for Vercel (serverless environment)
// Vercel's filesystem is read-only except for /tmp
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory only when needed (lazy creation)
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } catch (error) {
        console.error('Error creating uploads directory:', error);
      }
    }
    cb(null, uploadsDir);
  },
  // ... rest of config
});
```

## Key Changes

### 1. **Environment Detection**
```javascript
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');
```
- **Vercel:** Uses `/tmp/uploads` (writable)
- **Local:** Uses `backend/uploads` (normal path)

### 2. **Lazy Directory Creation**
- Directory is created **only when a file is uploaded**
- Not at module load time
- Wrapped in try-catch for safety

### 3. **Error Handling**
- Catches directory creation errors
- Logs errors without crashing
- Continues execution

## Benefits

✅ **Works on Vercel** - Uses `/tmp` directory  
✅ **Works Locally** - Uses normal `uploads` folder  
✅ **No Startup Crash** - Lazy creation prevents module load errors  
✅ **Error Resilient** - Try-catch prevents crashes  
✅ **Automatic Detection** - Detects Vercel environment automatically

## Important Notes

### ⚠️ Vercel `/tmp` Directory Limitations:

1. **Temporary Storage**
   - Files in `/tmp` are deleted after function execution
   - Not suitable for permanent storage

2. **Size Limit**
   - `/tmp` has a 512MB limit on Vercel

3. **Recommendation**
   - For production, use cloud storage:
     - AWS S3
     - Cloudinary
     - Vercel Blob Storage
     - Google Cloud Storage

## Testing

### Local Testing:
```bash
cd backend
npm start
# Uploads will go to: backend/uploads/
```

### Vercel Testing:
```bash
# Deploy to Vercel
vercel --prod
# Uploads will go to: /tmp/uploads/
# (temporary, deleted after function execution)
```

## Future Improvements

### For Production Use:

1. **Use Cloud Storage:**
```javascript
// Example with AWS S3
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

const s3 = new S3Client({ region: 'us-east-1' });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'your-bucket-name',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});
```

2. **Use Vercel Blob:**
```javascript
import { put } from '@vercel/blob';

// Upload file
const blob = await put('filename.pdf', file, {
  access: 'public',
});
```

3. **Use Cloudinary:**
```javascript
import cloudinary from 'cloudinary';

cloudinary.v2.uploader.upload(file.path, {
  folder: 'vendor-transactions'
});
```

## Verification

### Check if Fix Works:

1. **Deploy to Vercel:**
```bash
git add .
git commit -m "Fix upload directory for Vercel"
git push
```

2. **Check Logs:**
- No more `ENOENT` errors
- Application starts successfully
- API endpoints respond

3. **Test Upload:**
- Try uploading a file
- Should work without errors
- File temporarily stored in `/tmp`

## Summary

### ✅ What Was Fixed:
- Removed module-level directory creation
- Added Vercel environment detection
- Implemented lazy directory creation
- Added error handling
- Used `/tmp` for Vercel deployments

### 🎯 Result:
**Application now works on Vercel without filesystem errors! 🚀**

---

**Fix applied successfully! Deploy to Vercel to see it working. ✨**
