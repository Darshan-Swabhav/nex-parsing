const { AccountSuppression } = require('@nexsalesdev/dataautomation-datamodel');
const settingsConfig = require('../../../../config/settings/settings-config');

function AccountSuppressionCRUDService() {
  const config = settingsConfig.settings || {};

  // reasonable defaults for values
  this.config = config;
  this.logger = settingsConfig.logger || console;
}

async function getAccountSuppression(inputs) {
  try {
    const result = await AccountSuppression.findAndCountAll(inputs.query);
    return result;
  } catch (err) {
    return err;
  }
}

AccountSuppressionCRUDService.prototype = {
  getAccountSuppression,
};

module.exports = AccountSuppressionCRUDService;
