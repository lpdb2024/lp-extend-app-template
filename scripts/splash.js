#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const rootPkg = require('../package.json');
const version = rootPkg.version;

const cyan = (t) => `\x1b[36m${t}\x1b[0m`;
const dim = (t) => `\x1b[2m${t}\x1b[0m`;
const bold = (t) => `\x1b[1m${t}\x1b[0m`;
const magenta = (t) => `\x1b[35m${t}\x1b[0m`;
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const red = (t) => `\x1b[31m${t}\x1b[0m`;
const white = (t) => `\x1b[37m${t}\x1b[0m`;

const logo = `
${cyan(`          ██╗  ██╗`)}${magenta(`████████╗███████╗███╗   ██╗██████╗ `)}
${cyan(`          ╚██╗██╔╝`)}${magenta(`╚══██╔══╝██╔════╝████╗  ██║██╔══██╗`)}
${cyan(`     █████╗╚███╔╝ `)}${magenta(`   ██║   █████╗  ██╔██╗ ██║██║  ██║`)}
${cyan(`     ╚════╝██╔██╗ `)}${magenta(`   ██║   ██╔══╝  ██║╚██╗██║██║  ██║`)}
${cyan(`          ██╔╝ ██╗`)}${magenta(`   ██║   ███████╗██║ ╚████║██████╔╝`)}
${cyan(`          ╚═╝  ╚═╝`)}${magenta(`   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═════╝ `)}
`;

/**
 * Safely read an installed package version from node_modules
 */
function getInstalledVersion(packageDir, packageName) {
  try {
    const pkgPath = path.join(__dirname, '..', packageDir, 'node_modules', packageName, 'package.json');
    if (fs.existsSync(pkgPath)) {
      return require(pkgPath).version;
    }
  } catch {}
  return null;
}

/**
 * Print the splash screen with version info
 */
function printSplash(mode) {
  const nodeSDK = getInstalledVersion('api', '@lpextend/node-sdk');
  const clientSDK = getInstalledVersion('web', '@lpextend/client-sdk');

  const tagline = `  ${bold('Full-stack development framework for LivePerson Conversational Cloud')}`;

  const modeLabels = {
    dev: `${green('●')} ${bold('Development')}`,
    api: `${green('●')} ${bold('API Server')}`,
    web: `${green('●')} ${bold('Web Client')}`,
    install: `${yellow('●')} ${bold('Installing dependencies...')}`,
    upgrade: `${yellow('●')} ${bold('Upgrading SDK packages...')}`,
  };

  console.log(logo);
  console.log(tagline);
  console.log();

  // Version table
  console.log(`  ${dim('Template')}    ${white(`v${version}`)}`);
  if (nodeSDK) {
    console.log(`  ${dim('Node SDK')}    ${white(`v${nodeSDK}`)}`);
  }
  if (clientSDK) {
    console.log(`  ${dim('Client SDK')}  ${white(`v${clientSDK}`)}`);
  }
  console.log();

  if (modeLabels[mode]) {
    console.log(`  ${modeLabels[mode]}`);
    console.log();
  }
}

const mode = process.argv[2] || 'dev';
printSplash(mode);
