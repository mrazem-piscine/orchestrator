// PM2 ecosystem configuration for Billing API
module.exports = {
  apps: [{
    name: 'billing',
    script: './server.js',
    cwd: '/vagrant/srcs/billing-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/billing-error.log',
    out_file: '/var/log/pm2/billing-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

