# Master Minds – Complete Setup & Deployment Guide

> **Stack:** Next.js 14 · Firebase (Auth + Firestore + Storage) · Razorpay · Tailwind CSS

---

## TABLE OF CONTENTS

1. Prerequisites
2. Project Setup – Local
3. Firebase Setup (Step by Step)
4. Firestore Collections Reference
5. Firestore Security Rules
6. Storage Security Rules
7. Razorpay Setup
8. Environment Variables (.env.local)
9. Create First Admin User
10. Run Locally
11. Deploy to Vercel (Recommended)
12. Deploy to Firebase Hosting
13. Connect Custom Domain
14. All Routes Reference
15. Troubleshooting & FAQ

---

## 1. Prerequisites

Install these on your computer first:

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node |
| Git | Any | https://git-scm.com |
| Firebase CLI | Latest | `npm install -g firebase-tools` |

Verify:
```bash
node --version     # v18.x.x or higher
npm --version      # 9.x.x or higher
firebase --version # 13.x.x or higher
```

---

## 2. Project Setup – Local

```bash
# 1. Enter the project directory
cd master-minds

# 2. Install all npm packages
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Fill in .env.local with your Firebase + Razorpay keys (see Section 8)
```

---

## 3. Firebase Setup (Step by Step)

### 3a. Create a Firebase Project

1. Open https://console.firebase.google.com
2. Click **"Add project"**
3. Name it e.g. `master-minds`
4. Disable Google Analytics (not needed)
5. Click **"Create project"** and wait

---

### 3b. Enable Email/Password Authentication

1. Left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, click **Email/Password**
4. Toggle the first switch to **Enable**
5. Click **Save**

---

### 3c. Create Firestore Database

1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Location: **asia-south1** (Mumbai — best for India)
5. Click **"Enable"**

---

### 3d. Create Storage Bucket

1. Left sidebar → **Build → Storage**
2. Click **"Get started"**
3. Select **"Start in production mode"**
4. Same location: **asia-south1**
5. Click **"Done"**

---

### 3e. Get Client-Side Config Keys

1. **Project Settings** (gear icon, top-left)
2. Scroll to **"Your apps"** → click **Web** icon (</>)
3. Nickname: `master-minds-web` → **Register app**
4. Copy the values from the `firebaseConfig` object:

```js
// These map to your .env.local variables:
apiKey            → NEXT_PUBLIC_FIREBASE_API_KEY
authDomain        → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
projectId         → NEXT_PUBLIC_FIREBASE_PROJECT_ID
storageBucket     → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
messagingSenderId → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
appId             → NEXT_PUBLIC_FIREBASE_APP_ID
```

---

### 3f. Get Admin SDK Private Key (Server-Side)

1. **Project Settings → Service accounts** tab
2. Click **"Generate new private key"**
3. Save the downloaded JSON file safely
4. Open it and copy:

```
project_id   → FIREBASE_ADMIN_PROJECT_ID
client_email → FIREBASE_ADMIN_CLIENT_EMAIL
private_key  → FIREBASE_ADMIN_PRIVATE_KEY
```

> IMPORTANT: The private_key contains newlines.
> In .env.local, paste it wrapped in double quotes:
> FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

---

## 4. Firestore Collections Reference

All collections auto-create when you first write a document.

### users
```
uid:       "firebase-uid-string"
email:     "admin@example.com"
role:      "admin"
createdAt: "2024-01-01T00:00:00.000Z"
```

### jobNotifications
```
title:       "SSC CGL 2024 Notification"
company:     "Staff Selection Commission"
category:    "SSC"
description: "2000 vacancies for..."
eligibility: "Graduate, Age 18-32"
applyLink:   "https://ssc.nic.in"
videoLink:   "https://youtube.com/..."   (optional)
imageUrl:    "https://firebasestorage..."(optional)
adminBy:     "Admin Name"
isPublished: true
createdAt:   Timestamp
updatedAt:   Timestamp
```

### mockTests
```
title:          "SSC GK Practice 2024"
category:       "General Knowledge"
totalQuestions: 50
timeInMinutes:  60
negativeMarking: 0.25
price:          0
isPremium:      false
isPublished:    true
adminBy:        "Admin"
createdAt:      Timestamp
updatedAt:      Timestamp
```

### mockTestQuestions
```
testId:        "parent-test-doc-id"
question:      { en: "...", te: "...", hi: "..." }
options:       [
                 { en: "Option A", te: "...", hi: "..." },
                 { en: "Option B", te: "...", hi: "..." },
                 { en: "Option C", te: "...", hi: "..." },
                 { en: "Option D", te: "...", hi: "..." }
               ]
correctAnswer: 0    (0=A, 1=B, 2=C, 3=D)
explanation:   "Because..."  (optional)
imageUrl:      "https://..."  (optional)
order:         1
```

### studyMaterials
```
title:        "Maths Complete Notes"
category:     "Mathematics"
description:  "Covers all SSC topics..."
fileUrl:      "https://firebasestorage..."
fileName:     "maths.pdf"
fileSizeKb:   2048
previewPages: 5
price:        99
isPublished:  true
adminBy:      "Priya Sharma"
thumbnailUrl: "https://..."  (optional)
createdAt:    Timestamp
updatedAt:    Timestamp
```

### articlePosts (Education Info + Current Affairs)
```
title:         "UPSC 2024 Prelims Analysis"
content:       "<h2>Intro</h2><p>...</p>"
imageUrl:      "https://..."  (optional)
category:      "Education Info" OR "Current Affairs"
adminBy:       "Anika Sharma"
isPublished:   true
publishedDate: "2024-01-15T00:00:00.000Z"
createdAt:     Timestamp
updatedAt:     Timestamp
```

### purchases (written by server after payment)
```
userId:            "firebase-auth-uid"
userEmail:         "user@example.com"
itemId:            "material-or-test-doc-id"
itemType:          "studyMaterial" OR "mockTest"
itemTitle:         "Maths Notes"
amount:            99
razorpayOrderId:   "order_xxx"
razorpayPaymentId: "pay_xxx"
status:            "paid"
createdAt:         "2024-01-15T00:00:00.000Z"
```

---

## 5. Firestore Security Rules

Go to Firebase Console → Firestore → Rules tab.
Replace all existing content and click Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid))
          .data.role == 'admin';
    }

    match /users/{uid} {
      allow read:  if isAdmin() || (isAuthenticated() && request.auth.uid == uid);
      allow write: if isAdmin();
    }

    match /jobNotifications/{docId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /mockTests/{docId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /mockTestQuestions/{docId} {
      allow read:  if isAuthenticated();
      allow write: if isAdmin();
    }

    match /studyMaterials/{docId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /articlePosts/{docId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /purchases/{docId} {
      allow read:   if isAdmin() ||
                    (isAuthenticated() && resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

Then deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## 6. Storage Security Rules

Go to Firebase Console → Storage → Rules tab.
Replace all existing content and click Publish:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuth() { return request.auth != null; }
    function underMB(mb) { return request.resource.size < mb * 1024 * 1024; }
    function isImage() { return request.resource.contentType.matches('image/.*'); }

    match /job-images/{file} {
      allow read: if true;
      allow write: if isAuth() && isImage() && underMB(5);
    }
    match /article-images/{file} {
      allow read: if true;
      allow write: if isAuth() && isImage() && underMB(5);
    }
    match /material-thumbnails/{file} {
      allow read: if true;
      allow write: if isAuth() && isImage() && underMB(5);
    }
    match /question-images/{file} {
      allow read: if isAuth();
      allow write: if isAuth() && isImage() && underMB(5);
    }
    match /material-pdfs/{file} {
      allow read: if isAuth();
      allow write: if isAuth()
                   && request.resource.contentType == 'application/pdf'
                   && underMB(50);
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 7. Razorpay Setup

### Create Account
1. Go to https://razorpay.com → Sign Up
2. Complete KYC (required for live payments)

### Get API Keys
1. Dashboard → Settings → API Keys
2. Click "Generate Test Key"
3. Copy Key ID and Key Secret

### Test Card for Development
```
Card Number: 4111 1111 1111 1111
Expiry:      Any future date (e.g. 12/27)
CVV:         Any 3 digits (e.g. 123)
OTP:         Any value shown in popup
```

### Go Live
Replace `rzp_test_` keys with `rzp_live_` keys in production env vars.

---

## 8. Environment Variables (.env.local)

Create this file in the project root. Never commit it to Git.

```
# Firebase Client (Public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# Firebase Admin (Server-only — NEVER expose)
FIREBASE_ADMIN_PROJECT_ID=yourproject
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@yourproject.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
SETUP_SECRET_KEY=any-long-random-string
```

The .gitignore already contains .env.local — it will never be committed.

---

## 9. Create First Admin User

### Method A – Using the seed API (easiest)

Start the dev server:
```bash
npm run dev
```

In a new terminal:
```bash
curl -X POST http://localhost:3000/api/seed-admin \
  -H "Content-Type: application/json" \
  -H "x-setup-key: YOUR_SETUP_SECRET_KEY" \
  -d '{"email":"admin@yoursite.com","password":"SecurePassword123"}'
```

You should see:
```json
{ "success": true, "uid": "abc123", "message": "Admin user created." }
```

### Method B – Manually in Firebase Console

Step 1: Firebase Console → Authentication → Users → Add User
        Enter email + password → Add User → Copy the UID

Step 2: Firestore → users collection → Add document
        Document ID = UID from Step 1
        Add these fields:
          uid       (string) = same UID
          email     (string) = your email
          role      (string) = admin
          createdAt (string) = 2024-01-01T00:00:00.000Z

Step 3: Log in at http://localhost:3000/admin/login

IMPORTANT: Disable or delete /api/seed-admin after creating your admin.

---

## 10. Run Locally

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Local URLs:
```
Homepage:        http://localhost:3000
Jobs:            http://localhost:3000/jobs
Tests:           http://localhost:3000/tests
Materials:       http://localhost:3000/materials
News:            http://localhost:3000/news
Admin Login:     http://localhost:3000/admin/login
Admin Dashboard: http://localhost:3000/admin/dashboard
```

---

## 11. Deploy to Vercel (Recommended)

Vercel is the best option for Next.js — zero config, free tier, automatic HTTPS.

### Step 1 – Push code to GitHub

```bash
git init
git add .
git commit -m "Initial Master Minds commit"

# Create repo on github.com first, then:
git remote add origin https://github.com/YOURNAME/master-minds.git
git branch -M main
git push -u origin main
```

### Step 2 – Import to Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project"
3. Click "Import" next to your repo
4. Framework: Next.js (auto-detected)
5. Do NOT change any other settings

### Step 3 – Add Environment Variables

Vercel Dashboard → your project → Settings → Environment Variables

Add every variable from your .env.local.

For FIREBASE_ADMIN_PRIVATE_KEY: paste the value exactly including
the \n characters — Vercel handles them correctly.

Set Environment to: Production + Preview + Development

### Step 4 – Deploy

Click "Deploy". Your site is live in 2-3 minutes.

### Future Updates

```bash
# Just push to GitHub — Vercel auto-deploys
git add .
git commit -m "Update description"
git push
```

---

## 12. Deploy to Firebase Hosting

Use this if you prefer keeping everything in Firebase.

NOTE: Firebase Hosting needs Firebase Cloud Functions to run
Next.js API routes. This requires the Blaze (pay-as-you-go) plan.
Vercel is simpler for Next.js.

### Step 1 – Login

```bash
firebase login
```

### Step 2 – Initialize

```bash
firebase init
```

Select with spacebar:
  [x] Firestore
  [x] Hosting: Configure files for Firebase Hosting
  [x] Storage

Hosting settings:
  Public directory: out
  Single-page app: Yes (y)
  Automatic builds with GitHub: No (n)

### Step 3 – Build

```bash
npm run build
```

### Step 4 – Deploy

```bash
firebase deploy
```

Deploy specific parts:
```bash
firebase deploy --only hosting          # Web files only
firebase deploy --only firestore:rules  # Firestore rules
firebase deploy --only firestore:indexes
firebase deploy --only storage          # Storage rules
```

Your site: https://YOUR-PROJECT-ID.web.app

---

## 13. Connect Custom Domain

### On Vercel

1. Vercel → your project → Settings → Domains
2. Type: masterminds.in → Add
3. Add these DNS records at your domain registrar:
   ```
   Type: A     Name: @    Value: 76.76.21.21
   Type: CNAME Name: www  Value: cname.vercel-dns.com
   ```
4. Wait 10-60 minutes for DNS to propagate
5. Vercel auto-adds free SSL certificate

### On Firebase Hosting

1. Firebase Console → Hosting → Add custom domain
2. Enter your domain → Continue
3. Add the TXT record to verify ownership
4. Click Verify → Add the provided A records
5. SSL auto-provisioned within 24 hours

Popular Indian domain registrars: GoDaddy India, BigRock, Namecheap

---

## 14. All Routes Reference

### Public Pages
```
/                    Homepage with hero, features, latest jobs
/jobs                All published job notifications
/jobs/[id]           Full job detail + apply + video + WhatsApp share
/tests               All published mock tests grid
/tests/[id]          Test instructions + start button
/tests/[id]/start    Full test engine (timer, palette, multi-language)
/materials           All published study materials
/materials/[id]      Material detail + protected PDF viewer + payment
/news                Education Info + Current Affairs listing
/news/[id]           Full article with rich text + share buttons
```

### Admin Pages (require login)
```
/admin/login              Admin login page
/admin/dashboard          Overview with stats
/admin/jobs               List all jobs
/admin/jobs/new           Create new job
/admin/jobs/[id]/edit     Edit existing job
/admin/tests              List all tests
/admin/tests/new          Create test + question builder
/admin/tests/[id]/edit    Edit test + questions
/admin/materials          List all materials
/admin/materials/new      Upload new PDF material
/admin/materials/[id]/edit Edit material
/admin/articles           List all articles
/admin/articles/new       Write new article (rich text editor)
/admin/articles/[id]/edit Edit article
/admin/payments           View all Razorpay transactions
/admin/settings           Create admin users + view rules
```

### API Routes
```
POST /api/create-order      Creates Razorpay payment order
POST /api/verify-payment    Verifies payment + records purchase
POST /api/seed-admin        Creates first admin (disable after use)
```

---

## 15. Troubleshooting & FAQ

### "Firebase: No Firebase App '[DEFAULT]' has been created"
→ Your NEXT_PUBLIC_FIREBASE_* variables are missing or wrong
→ Check .env.local spelling matches exactly
→ Restart npm run dev after changing .env.local

### "Missing or insufficient permissions" in Firestore
→ Deploy the rules from Section 5
→ Verify the admin user's Firestore doc has role = "admin" (exact string)

### "Error: PEM_read_bio_PrivateKey" (Admin SDK)
→ Your private key has wrong formatting
→ It must be: "-----BEGIN PRIVATE KEY-----\nKEY_DATA\n-----END PRIVATE KEY-----\n"
→ The \n must be literal backslash-n characters inside double quotes

### Razorpay: "key_id is required"
→ Make sure NEXT_PUBLIC_RAZORPAY_KEY_ID is set (not just RAZORPAY_KEY_ID)

### PDF viewer not loading (CORS error)
Run in Google Cloud Shell or terminal with gcloud:
```bash
echo '[{"origin":["*"],"method":["GET"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://YOUR_BUCKET.appspot.com
```

### Images return 403 in production
→ Check Storage rules allow public read for job-images and article-images

### Build fails: "Module not found"
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Admin login redirects to login again
→ Your user document in Firestore/users must have role: "admin"
→ Check for typos — it's case-sensitive

### Vercel: Private key error in production
→ In Vercel Environment Variables, paste the private key with literal \n
→ Do not use actual newlines in the Vercel UI — use \n

---

## Quick Commands Cheatsheet

```bash
# Development
npm install              # Install packages
npm run dev              # Start dev server (:3000)
npm run build            # Production build
npm start                # Serve production build

# Firebase CLI
firebase login           # Authenticate
firebase deploy          # Deploy everything
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
firebase emulators:start # Local Firebase emulator (no cloud needed)

# Git workflow
git add .
git commit -m "message"
git push origin main     # Auto-deploys on Vercel
```

---

Built with dedication for Master Minds – The Learning Hub
