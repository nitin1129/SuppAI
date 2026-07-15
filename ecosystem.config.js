// PM2 process config for the Hostinger VPS.
//   pm2 start ecosystem.config.js --env production
// Run from the project root (where package.json lives).

module.exports = {
  apps: [
    {
      name: "suppai",
      // Call the Next binary directly: more reliable under PM2 than `npm start`,
      // because signals reach the Node process instead of an npm wrapper.
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
