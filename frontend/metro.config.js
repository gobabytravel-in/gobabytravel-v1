// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

const nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// On Replit the monorepo root node_modules exists; on EAS only frontend/ is uploaded.
if (fs.existsSync(path.resolve(workspaceRoot, 'node_modules'))) {
  config.watchFolders = [workspaceRoot];
  nodeModulesPaths.push(path.resolve(workspaceRoot, 'node_modules'));
}

config.resolver.nodeModulesPaths = nodeModulesPaths;

config.maxWorkers = 2;

module.exports = config;
