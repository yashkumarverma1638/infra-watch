open server by node src/server.js

Flow of the project

User adds URL
      ↓
Cron job runs every 30s
      ↓
Website ping
      ↓
Status + response time stored
      ↓
API returns uptime + metrics

cmd => stripe listen --forward-to localhost:5000/api/payments/webhook/stripe
