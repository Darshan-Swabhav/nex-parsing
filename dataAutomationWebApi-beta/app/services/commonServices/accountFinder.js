const { Account } = require('@nexsalesdev/dataautomation-datamodel');
const { serializeError } = require('serialize-error');
const settingsConfig = require('../../config/settings/settings-config');

class AccountFinder {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;
  }

  async findAccount(accountId) {
    if (!accountId) {
      const error = new Error();
      error.message = `accountId is required`;
      error.code = `BAD_ACCOUNT_ID`;
      const serializedError = serializeError(error);
      this.logger.error(
        `[FIND_ACCOUNT] :: Could Not Find Reference ID to Find Account : ${JSON.stringify(
          serializedError,
        )}`,
      );
      throw serializedError;
    }

    // Find Account if Exist
    const accountInstance = await Account.findByPk(accountId);

    if (accountInstance) {
      this.logger.info(
        `[FIND_ACCOUNT] :: Account found with ID: ${accountInstance.id}`,
      );
      return accountInstance;
    }
    return null;
  }
}
module.exports = AccountFinder;
