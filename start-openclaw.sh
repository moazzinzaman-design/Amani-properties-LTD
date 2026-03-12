#!/bin/bash
echo "🚀 Booting up OpenClaw Gateway as a Permanent Daemon..."
npx pm2 start ecosystem.config.cjs
npx pm2 save
echo "✔ OpenClaw is now running natively in the background!"
echo "Use 'npx pm2 log openclaw-gateway' to see logs."
