#!/usr/bin/env node

/**
 * Kill Port Script
 *
 * Automatically kills any process running on the specified port before starting the dev server.
 * This prevents EADDRINUSE errors when multiple dev servers are accidentally started.
 */

const { execSync } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 9001;
const platform = os.platform();

console.log(`[kill-port] Checking for processes on port ${PORT}...`);

try {
  if (platform === 'win32') {
    // Windows: Find and kill process using the port
    try {
      const netstatOutput = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf-8' });
      const lines = netstatOutput.split('\n').filter(line => line.trim());

      const pids = new Set();
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      });

      if (pids.size > 0) {
        console.log(`[kill-port] Found ${pids.size} process(es) using port ${PORT}`);
        pids.forEach(pid => {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`[kill-port] Killed process with PID ${pid}`);
          } catch (err) {
            // Process might already be dead
          }
        });
      } else {
        console.log(`[kill-port] No processes found on port ${PORT}`);
      }
    } catch (err) {
      if (err.status === 1) {
        // No processes found (netstat returned empty)
        console.log(`[kill-port] No processes found on port ${PORT}`);
      } else {
        throw err;
      }
    }
  } else {
    // Unix-like systems (Linux, macOS)
    try {
      const lsofOutput = execSync(`lsof -ti:${PORT}`, { encoding: 'utf-8' });
      const pids = lsofOutput.trim().split('\n').filter(pid => pid);

      if (pids.length > 0) {
        console.log(`[kill-port] Found ${pids.length} process(es) using port ${PORT}`);
        pids.forEach(pid => {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`[kill-port] Killed process with PID ${pid}`);
          } catch (err) {
            // Process might already be dead
          }
        });
      } else {
        console.log(`[kill-port] No processes found on port ${PORT}`);
      }
    } catch (err) {
      if (err.status === 1) {
        // No processes found (lsof returned empty)
        console.log(`[kill-port] No processes found on port ${PORT}`);
      } else {
        throw err;
      }
    }
  }

  console.log(`[kill-port] Port ${PORT} is now available`);
} catch (error) {
  console.error(`[kill-port] Error: ${error.message}`);
  // Don't exit with error - allow the dev server to start anyway
}
