# 🚀 Teerthesh Portfolio Backend

A Node.js + Express backend for the portfolio website with:
- ✅ Working contact form (saves messages + sends emails)
- ✅ Admin dashboard to view/manage messages
- ✅ Secure login with sessions
- ✅ Auto-reply emails to visitors

---

## 📁 Folder Structure

```
portfolio-backend/
├── server.js          ← Main backend server
├── package.json       ← Dependencies
├── .env.example       ← Environment variables template
├── data/
│   └── messages.json  ← Auto-created, stores messages
└── views/
    ├── login.html     ← Admin login page
    └── admin.html     ← Admin dashboard
```

---

## ⚡ Quick Start

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Setup environment
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your Gmail and password
```

### Step 3 — Start the server
```bash
npm start
```

### Step 4 — Open in browser
- Portfolio:  http://localhost:3000
- Admin:      http://localhost:3000/admin
- Login:      teerthesh / admin123

---

## 📧 Email Setup (Gmail)

1. Go to **myaccount.google.com**
2. Security → **2-Step Verification** (enable it)
3. Security → **App Passwords**
4. Create a new App Password for "Mail"
5. Copy the 16-character password into `.env`

---

## 🌐 Deploy to Railway (Free)

1. Go to **railway.app** and sign up
2. New Project → Deploy from GitHub
3. Upload this folder
4. Add environment variables in Railway dashboard
5. Done — your backend is live! 🎉

---

## 🔑 Change Admin Password

Edit `.env`:
```
ADMIN_USER=teerthesh
ADMIN_PASS=your-new-secure-password
```
