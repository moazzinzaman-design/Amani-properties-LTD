module.exports = {
  apps: [{
    name: "openclaw-gateway",
    script: "/usr/local/bin/openclaw",
    args: "gateway --port 18789",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      OPENCLAW_HOST: "127.0.0.1"
    }
  }]
}
