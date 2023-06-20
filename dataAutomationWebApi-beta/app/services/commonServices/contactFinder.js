const { Contact, Account } = require('@nexsalesdev/dataautomation-datamodel');
const { serializeError } = require('serialize-error');
const settingsConfig = require('../../config/settings/settings-config');

class ContactFinder {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;
  }

  async findContact(contactId) {
    if (!contactId) {
      const error = new Error();
      error.message = `contactId is required`;
      error.code = `BAD_CONTACT_ID`;
      const serializedError = serializeError(error);
      this.logger.error(
        `[FIND_CONTACT] :: Could Not Find Reference ID to Find Contact : ${JSON.stringify(
          serializedError,
        )}`,
      );
      throw error;
    }

    // Find Account if Exist
    const contactInstance = await Contact.findOne({
      where: {
        id: contactId,
      },
      include: [
        {
          model: Account,
        },
      ],
    });

    if (contactInstance) {
      this.logger.error(
        `[FIND_CONTACT] :: Contact found with ID: ${contactInstance.id}`,
      );
      return contactInstance;
    }
    return null;
  }
}

module.exports = ContactFinder;
