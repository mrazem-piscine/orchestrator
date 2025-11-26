// PM2 ecosystem configuration for Inventory API
module.exports = {
  apps: [{
    name: 'inventory',
    script: './server.js',
    cwd: '/vagrant/srcs/inventory-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      INVENTORY_PORT: 8080
    },
    error_file: '/var/log/pm2/inventory-error.log',
    out_file: '/var/log/pm2/inventory-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

