import { NextResponse } from 'next/server';
import net from 'net';
import fs from 'fs';
import path from 'path';
import os from 'os';

function checkPort(port = 18789) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 1000;
    
    console.log(`[HealthAPI] Checking port ${port}...`);
    socket.setTimeout(timeout);
    
    socket.once('connect', () => {
      console.log(`[HealthAPI] Port ${port} is OPEN`);
      socket.destroy();
      resolve(true);
    });
    
    socket.once('timeout', () => {
      console.log(`[HealthAPI] Port ${port} check TIMEOUT`);
      socket.destroy();
      resolve(false);
    });
    
    socket.once('error', (err) => {
      console.log(`[HealthAPI] Port ${port} check ERROR: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, '127.0.0.1');
  });
}

function getVersion() {
  try {
    const configPath = path.join(os.homedir(), '.openclaw/openclaw.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return data.meta?.lastTouchedVersion || 'unknown';
    }
  } catch {
    /* ignore */
  }
  return 'unknown';
}

export async function GET() {
  const isUp = await checkPort(18789);
  const version = getVersion();

  if (isUp) {
    return NextResponse.json({
      status: 'online',
      version,
      uptime: null,
      error: null
    });
  } else {
    return NextResponse.json({
      status: 'offline',
      version,
      error: 'Gateway not reachable on port 18789'
    });
  }
}
