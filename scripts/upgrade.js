#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const cyan = (t) => `\x1b[36m${t}\x1b[0m`;
const dim = (t) => `\x1b[2m${t}\x1b[0m`;
const bold = (t) => `\x1b[1m${t}\x1b[0m`;
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const red = (t) => `\x1b[31m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const white = (t) => `\x1b[37m${t}\x1b[0m`;

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'api');
const webDir = path.join(rootDir, 'web');

function getInstalledVersion(dir, pkg) {
  try {
    const pkgPath = path.join(dir, 'node_modules', pkg, 'package.json');
    if (fs.existsSync(pkgPath)) {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version;
    }
  } catch {}
  return null;
}

function run(cmd, cwd) {
  try {
    execSync(cmd, { cwd, stdio: 'pipe' });
    return true;
  } catch (e) {
    console.error(red(`  Failed: ${cmd}`));
    console.error(dim(`  ${e.stderr?.toString().trim() || e.message}`));
    return false;
  }
}

function getLatestVersion(pkg) {
  try {
    const result = execSync(`npm view ${pkg} version`, { stdio: 'pipe' }).toString().trim();
    return result;
  } catch {
    return null;
  }
}

// Show splash
require('./splash.js');

console.log(`  ${bold('Checking for updates...')}`);
console.log();

const packages = [
  { name: '@lpextend/node-sdk', dir: apiDir, dirLabel: 'api' },
  { name: '@lpextend/client-sdk', dir: webDir, dirLabel: 'web' },
];

let upgraded = 0;

for (const pkg of packages) {
  const current = getInstalledVersion(pkg.dir, pkg.name);
  const latest = getLatestVersion(pkg.name);

  if (!latest) {
    console.log(`  ${yellow('?')} ${pkg.name} ${dim('— could not fetch latest version')}`);
    continue;
  }

  if (!current) {
    console.log(`  ${yellow('+')} ${pkg.name} ${dim('not installed')} → ${green(`v${latest}`)}`);
    console.log(`    ${dim(`Installing in ${pkg.dirLabel}/...`)}`);
    if (run(`npm install ${pkg.name}@latest`, pkg.dir)) {
      console.log(`    ${green('Done')}`);
      upgraded++;
    }
    continue;
  }

  if (current === latest) {
    console.log(`  ${green('✓')} ${pkg.name} ${dim(`v${current}`)} ${dim('— up to date')}`);
    continue;
  }

  console.log(`  ${cyan('↑')} ${pkg.name} ${dim(`v${current}`)} → ${green(`v${latest}`)}`);
  console.log(`    ${dim(`Upgrading in ${pkg.dirLabel}/...`)}`);
  if (run(`npm install ${pkg.name}@latest`, pkg.dir)) {
    console.log(`    ${green('Done')}`);
    upgraded++;
  }
}

console.log();
if (upgraded > 0) {
  console.log(`  ${green('●')} ${bold(`Upgraded ${upgraded} package${upgraded > 1 ? 's' : ''}`)}`);
} else {
  console.log(`  ${green('●')} ${bold('All packages are up to date')}`);
}
console.log();
