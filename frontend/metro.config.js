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

// Shim Node.js built-ins that some packages (e.g. ws, used by Supabase/Firebase)
// try to import but are not available in React Native's Metro bundler.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: path.resolve(__dirname, 'shims/stream.js'),
};

module.exports = config;
