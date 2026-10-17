// ============================================================================
// TOPUPKU - PM2 CLUSTER DEPLOYMENT CONFIGURATION
// Run with: pm2 start ecosystem.config.js --env production
// ============================================================================

module.exports = {
  apps: [
    {
      name: "topupku-fullstack",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        TZ: "Asia/Jakarta",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        TZ: "Asia/Jakarta",
      },
    },
  ],
};
