module.exports = {
  apps: [{
    name: 'streamflow',
    script: './app.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M', // Turun dari 1G ke 512M
    env: {
      NODE_ENV: 'production',
      PORT: 7575,
      // Node.js memory optimization
      NODE_OPTIONS: '--max-old-space-size=384 --optimize-for-size'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 3000, // Turun dari 5000
    listen_timeout: 8000, // Turun dari 10000
    shutdown_with_message: true,
    // Optimasi tambahan
    node_args: '--max-old-space-size=384 --optimize-for-size',
    max_old_space_size: 384
  }]
};
