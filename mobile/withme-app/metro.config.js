// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly disable package exports support as a workaround for potential issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
