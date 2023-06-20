const { ContactSuppression } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../../config/settings/settings-config');

function ContactSuppressionCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getContactSuppression(inputs) {
  try {
    const result = await ContactSuppression.findAndCountAll(inputs.query);
    return result;
  } catch (err) {
    return err;
  }
}

ContactSuppressionCRUDService.prototype = {
  getContactSuppression,
};

module.exports = ContactSuppressionCRUDService;
