require('./src/config/loadEnv');

module.exports = {
  apps: [
    {
      name: 'tours-api',
      cwd: __dirname,
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        HOST: process.env.HOST || '0.0.0.0',
        PORT: process.env.PORT || 5000,
      },
    },
  ],
};
