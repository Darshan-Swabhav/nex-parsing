/* eslint-disable global-require */
const { Location } = require('@nexsalesdev/master-data-model');
const settingsConfig = require('../../../config/settings/settings-config');

function LocationService() {
  const config = settingsConfig.settings || {};
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getLocationCounts() {
  const count = await Location.count({
    raw: true,
    subQuery: false,
  });
  return count;
}

LocationService.prototype = {
  getLocationCounts,
};

module.exports = LocationService;
