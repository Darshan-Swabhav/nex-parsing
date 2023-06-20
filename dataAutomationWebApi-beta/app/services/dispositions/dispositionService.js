const { Disposition } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../config/settings/settings-config');

function DispositionCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAllDisposition() {
  const result = await Disposition.findAll({
    attributes: [
      'id',
      'dispositionType',
      'dispositionLevel',
      'dispositionCategory',
    ],
    order: [['dispositionType', 'ASC']],
  });

  return result;
}

DispositionCRUDService.prototype = {
  getAllDisposition,
};

module.exports = DispositionCRUDService;
