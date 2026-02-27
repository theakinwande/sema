const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const messageRoutes = require('./routes/messages');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Custom Swagger CSS
const swaggerCss = `
  * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important; }
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info { margin: 30px 0; }
  .swagger-ui .info hgroup.main h2 { font-size: 14px; color: #86868b; font-weight: 400; }
  .swagger-ui .info .title { font-size: 28px; font-weight: 700; color: #1d1d1f; }
  .swagger-ui .info .description p { color: #86868b; font-size: 15px; }
  .swagger-ui .scheme-container { background: #f5f5f7; border: 1px solid #e8e8ed; border-radius: 10px; padding: 16px; box-shadow: none; }
  .swagger-ui .opblock-tag { font-size: 18px; font-weight: 600; border-bottom: 1px solid #e8e8ed; }
  .swagger-ui .opblock { border-radius: 10px; border: 1px solid #e8e8ed; box-shadow: none; margin-bottom: 8px; }
  .swagger-ui .opblock .opblock-summary { border-radius: 10px; padding: 10px 16px; }
  .swagger-ui .opblock.opblock-post { border-color: #e8e8ed; background: rgba(73,204,144,.04); }
  .swagger-ui .opblock.opblock-get { border-color: #e8e8ed; background: rgba(97,175,254,.04); }
  .swagger-ui .opblock.opblock-put { border-color: #e8e8ed; background: rgba(252,161,48,.04); }
  .swagger-ui .opblock.opblock-delete { border-color: #e8e8ed; background: rgba(249,62,62,.04); }
  .swagger-ui .opblock.opblock-patch { border-color: #e8e8ed; background: rgba(80,227,194,.04); }
  .swagger-ui .btn.execute { background: #1d1d1f; border-radius: 8px; border: none; }
  .swagger-ui .btn.execute:hover { opacity: 0.85; }
  .swagger-ui .btn.authorize { background: #1d1d1f; color: white; border: none; border-radius: 8px; }
  .swagger-ui .btn.authorize svg { fill: white; }
  .swagger-ui input[type=text], .swagger-ui textarea { border-radius: 8px; border: 1.5px solid #e8e8ed; font-size: 14px; }
  .swagger-ui input[type=text]:focus, .swagger-ui textarea:focus { border-color: #1d1d1f; outline: none; }
  .swagger-ui .model-box { border-radius: 8px; }
  body { background: #ffffff; }
`;

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: swaggerCss,
  customSiteTitle: 'Sema API Docs',
  customfavIcon: '',
}));

// Serve raw spec as JSON
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);

// Health page
app.get('/api/health', async (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStatus = dbState[mongoose.connection.readyState] || 'unknown';

  const User = require('./models/User');
  const Message = require('./models/Message');

  let userCount = 0;
  let messageCount = 0;
  try {
    userCount = await User.countDocuments();
    messageCount = await Message.countDocuments();
  } catch (e) { /* ignore */ }

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sema — API Health</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #fff; color: #1d1d1f; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { max-width: 420px; width: 100%; padding: 40px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 999px; font-size: 13px; font-weight: 500; color: #16a34a; margin-bottom: 20px; }
    .badge-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
    h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 6px; }
    .sub { font-size: 15px; color: #86868b; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .stat { padding: 16px; background: #f5f5f7; border-radius: 12px; }
    .stat-label { font-size: 12px; font-weight: 600; color: #afafb2; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .stat-value.green { color: #16a34a; }
    .links { display: flex; gap: 12px; }
    .link { padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 10px; text-decoration: none; transition: opacity 150ms; }
    .link--fill { background: #1d1d1f; color: #fff; }
    .link--outline { border: 1.5px solid #e8e8ed; color: #86868b; }
    .link:hover { opacity: 0.85; }
    .ts { margin-top: 24px; font-size: 12px; color: #d2d2d7; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="badge-dot"></span> All systems operational</div>
    <h1>💬 Sema API</h1>
    <p class="sub">Anonymous messaging platform</p>
    <div class="grid">
      <div class="stat">
        <div class="stat-label">Status</div>
        <div class="stat-value green" data-stat="status">● Healthy</div>
      </div>
      <div class="stat">
        <div class="stat-label">Database</div>
        <div class="stat-value ${dbStatus === 'connected' ? 'green' : ''}" data-stat="db">${dbStatus === 'connected' ? '● Connected' : '○ ' + dbStatus}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Users</div>
        <div class="stat-value" data-stat="users">${userCount.toLocaleString()}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Messages</div>
        <div class="stat-value" data-stat="messages">${messageCount.toLocaleString()}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Uptime</div>
        <div class="stat-value" data-stat="uptime">${hours}h ${mins}m ${secs}s</div>
      </div>
      <div class="stat">
        <div class="stat-label">Node</div>
        <div class="stat-value">${process.version}</div>
      </div>
    </div>
    <div class="links">
      <a href="/api/docs" class="link link--fill">API Docs</a>
      <a href="/" class="link link--outline">Open App</a>
    </div>
    <p class="ts" data-stat="ts">${new Date().toISOString()}</p>
  </div>
  <script>
    function fmt(s) {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      return h + 'h ' + m + 'm ' + sec + 's';
    }
    setInterval(async () => {
      try {
        const r = await fetch('/api/health.json');
        const d = await r.json();
        const el = (s) => document.querySelector('[data-stat="' + s + '"]');
        if (d.database === 'connected') {
          el('db').textContent = '● Connected';
          el('db').className = 'stat-value green';
        } else {
          el('db').textContent = '○ ' + d.database;
          el('db').className = 'stat-value';
        }
        el('users').textContent = (d.users || 0).toLocaleString();
        el('messages').textContent = (d.messages || 0).toLocaleString();
        el('uptime').textContent = fmt(d.uptime);
        el('ts').textContent = d.timestamp;
      } catch(e) {}
    }, 2000);
  </script>
</body>
</html>`;

  res.type('html').send(html);
});

// JSON health (for monitoring + live dashboard)
app.get('/api/health.json', async (req, res) => {
  const User = require('./models/User');
  const Message = require('./models/Message');
  let users = 0, messages = 0;
  try { users = await User.countDocuments(); messages = await Message.countDocuments(); } catch(e) {}
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    users,
    messages,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
