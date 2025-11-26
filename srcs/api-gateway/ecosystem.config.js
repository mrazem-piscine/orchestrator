// PM2 ecosystem configuration for API Gateway
module.exports = {
  apps: [{
    name: 'api-gateway',
    script: './server.js',
    cwd: '/vagrant/srcs/api-gateway',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      API_PORT: 3000
    },
    error_file: '/var/log/pm2/api-gateway-error.log',
    out_file: '/var/log/pm2/api-gateway-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

