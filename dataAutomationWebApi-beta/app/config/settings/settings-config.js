/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const os = require('os');

// const commandLineArgs = process.argv;

const nodeUtility = require('nodeUtility');
// This module initializes the sessionManager Web API with the required configuration.
const mainConfig = require('./main');
// Load configuration from the configuration system
const appConfig = new nodeUtility.AppConfig({ config: mainConfig }, true);

function loadDefaultSettings(_settings) {
  const settings = _settings;
  settings.environment = settings.environment
    ? settings.environment.toLowerCase()
    : 'local';
  settings.thisnode.hostName = settings.thisnode.hostName
    ? settings.thisnode.hostName
    : '127.0.0.1';
  settings.thisnode.port = settings.thisnode.port
    ? parseInt(settings.thisnode.port, 10)
    : 20100;
}

function loadEnvironmentConfigFile(settings) {
  let config;

  let configLocation = './settings.config.local.json';
  if (settings.environment) {
    configLocation = `./settings.config.${settings.environment}.json`;
  }

  try {
    config = require(configLocation);
  } catch (e) {
    throw new Error(
      `Unable to parse "lib/config/settings/"${configLocation}: ${e}`,
    );
  }

  if (!config.settings) {
    throw new Error(`Property "settings" is no defined: ${configLocation}`);
  }

  return config;
}

function loadConfigSettings(_settings) {
  const settings = _settings;

  const config = loadEnvironmentConfigFile(settings);

  const settingsLength = config.settings.length;

  for (let i = 0; i < settingsLength; i += 1) {
    const configSetting = config.settings[i];

    if (configSetting.name && configSetting.value) {
      settings[configSetting.name] = configSetting.value;
    }
  }
}

function loadServerSettings(_settings) {
  const settings = _settings;
  settings.serverName = os.hostname().toLowerCase();
  settings.serverCores = os.cpus().length;
}

function initializeSettings(settings) {
  loadDefaultSettings(settings);
  loadConfigSettings(settings);
  loadServerSettings(settings);
}

function SettingsConfig() {
  this.settings = appConfig.config;
  this.logger = appConfig.logger;
  this.consoleLogger = appConfig.consoleLogger;

  initializeSettings(this.settings, this.logger);
}

const settingsConfig = new SettingsConfig();

module.exports = settingsConfig;
