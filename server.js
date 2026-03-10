require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'messages.json');

// ─── Middleware ───────────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'teerthesh-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// ─── Helpers ──────────────────────────────────────────────
function loadMessages() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveMessages(messages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

function requireLogin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/login');
}

// ─── Email Transporter (Gmail) ────────────────────────────
// Replace with your Gmail & App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// ══════════════════════════════════════════════════════════
//  API ROUTES
// ══════════════════════════════════════════════════════════

// POST /api/contact — receive form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Please fill all required fields.' });
  }

  // Save to JSON file
  const messages = loadMessages();
  const newMsg = {
    id: Date.now().toString(),
    name, email,
    subject: subject || '(No subject)',
    message,
    date: new Date().toISOString(),
    read: false
  };
  messages.unshift(newMsg);
  saveMessages(messages);

  // Send email notification to you
  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📬 New message from ${name}: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g,'<br>')}</p>
        <p><small>Received: ${new Date().toLocaleString()}</small></p>
      `
    });

    // Auto-reply to visitor
    await transporter.sendMail({
      from: `"Teerthesh" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thanks for reaching out, ${name}! 👋`,
      html: `
        <h2>Hi ${name}!</h2>
        <p>Thanks for getting in touch. I received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong><br>${message.replace(/\n/g,'<br>')}</p>
        <br>
        <p>Best,<br><strong>Teerthesh</strong></p>
      `
    });
  } catch (err) {
    console.log('Email not sent (configure EMAIL_USER & EMAIL_PASS):', err.message);
  }

  res.json({ success: true, message: 'Message received! I\'ll get back to you soon.' });
});

// GET /api/messages — for admin (protected)
app.get('/api/messages', requireLogin, (req, res) => {
  res.json(loadMessages());
});

// PATCH /api/messages/:id/read — mark as read
app.patch('/api/messages/:id/read', requireLogin, (req, res) => {
  const messages = loadMessages();
  const msg = messages.find(m => m.id === req.params.id);
  if (msg) { msg.read = true; saveMessages(messages); }
  res.json({ success: true });
});

// DELETE /api/messages/:id — delete message
app.delete('/api/messages/:id', requireLogin, (req, res) => {
  let messages = loadMessages();
  messages = messages.filter(m => m.id !== req.params.id);
  saveMessages(messages);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════

// GET /admin/login
app.get('/admin/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// POST /admin/login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'teerthesh';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// GET /admin/logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// GET /admin — dashboard (protected)
app.get('/admin', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ─── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔑 Login: teerthesh / admin123\n`);
});
