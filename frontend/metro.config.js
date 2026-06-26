// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// The workspace root (one level up from frontend/)
const workspaceRoot = path.resolve(__dirname, '..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve modules from the workspace root node_modules
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Reduce workers for resource efficiency
config.maxWorkers = 2;

module.exports = config;
