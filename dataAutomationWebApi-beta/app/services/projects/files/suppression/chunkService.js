const { FileChunk } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../../config/settings/settings-config');

function FileChunkCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getFileChunk(inputs) {
  try {
    const result = await FileChunk.findAndCountAll(inputs.query);
    return result;
  } catch (err) {
    return err;
  }
}

FileChunkCRUDService.prototype = {
  getFileChunk,
};

module.exports = FileChunkCRUDService;
