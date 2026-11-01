 module.exports = {
  apps: [
    {
      name: "ieee-smc-2027",
      script: "/root/projects/ieee-smc-2027/.next/standalone/server.js",
      node_args: "--env-file=/root/projects/ieee-smc-2027/.env",
      cwd: "/root/projects/ieee-smc-2027",
      env: {
        PORT: 3002,
        NODE_ENV: "production",
      },
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
