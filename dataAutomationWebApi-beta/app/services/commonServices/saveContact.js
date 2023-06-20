/* eslint-disable global-require */
const { Contact, Account } = require('@nexsalesdev/dataautomation-datamodel');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const { uuid } = require('uuidv4');
const settingsConfig = require('../../config/settings/settings-config');

class ContactSaveService {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;

    const AccountFinder = require('./accountFinder');
    this.accountFinder = new AccountFinder();
    const ContactFinder = require('./contactFinder');
    this.contactFinder = new ContactFinder();
    const ContactCheckService = require('./checkContact');
    this.contactCheckService = new ContactCheckService();
    const Sanitizer = require('./sanitizer');
    this.sanitizer = new Sanitizer();
  }

  buildPrevious(_data) {
    const data = _data;
    if (data && _.isObject(data)) {
      const dataKeys = Object.keys(data);
      dataKeys.forEach((key) => {
        data[`${this.config.CONTACT_PREVIOUS_VALUE_PREFIX}${key}`] = data[key];
      });
    }
    return data;
  }

  async updateContact(_contact) {
    const contact = _contact;

    const contactInstance = await this.contactFinder.findContact(contact.id);

    if (contactInstance) {
      // contact.id = newContact.id;
      contact.createdBy = contactInstance.createdBy;

      const sanitizedContact = this.sanitizer.sanitize(contact);
      const sanitizedContactInstance = this.sanitizer.sanitize(contactInstance);

      const updatedContactInstance = _.merge(
        sanitizedContactInstance,
        sanitizedContact,
      );

      // postgres Model.save() not able to detect change in JSON fields
      // Github ISsue Link : https://github.com/sequelize/sequelize/issues/2862
      // https://sequelize.org/master/manual/upgrade-to-v6.html#-code-model-changed----code-
      if (contact.address) {
        updatedContactInstance.changed('address', true);
      }

      return updatedContactInstance.save();
    }

    // create error because given contact does not exist
    const error = new Error();
    error.code = 'BAD_CONTACT_ID';
    error.desc = `Could Not Find Contact with ID ${contact.id}`;
    const serializedError = serializeError(error);
    this.logger.error(
      `[SAVE_CONTACT] :: Error While Updating Contact : ${JSON.stringify(
        serializedError,
      )}`,
    );
    throw error;
  }

  async createContact(contactData) {
    const contact = contactData;
    contact.id = uuid();
    let sanitizedContact = this.sanitizer.sanitize(contact);
    sanitizedContact = this.buildPrevious(sanitizedContact);
    return Contact.create(sanitizedContact);
  }

  async saveContact(_contact) {
    const contact = _contact;

    if (!contact) {
      const error = new Error();
      error.message = `contact data is required`;
      error.code = `INVALID_INPUT`;
      const serializedError = serializeError(error);
      this.logger.error(
        `[CREATE_CONTACT] :: ERROR : ${JSON.stringify(serializedError)}`,
      );
      throw serializedError;
    }

    const accountId = contact.AccountId;
    const isAccountIdExist = !!accountId;

    if (!isAccountIdExist) {
      const error = new Error();
      error.message = `Could Not Find Account id`;
      error.code = 'ACCOUNT_ID_NOT_FOUND';
      const serializedErr = serializeError(error);
      this.logger.error(`[CREATE_CONTACT] :: ERROR : ${JSON.stringify(error)}`);
      throw serializedErr;
    }

    // Find Account if Exist
    const accountInstance = await this.accountFinder.findAccount(accountId);
    if (accountInstance === null) {
      const error = new Error();
      error.message = `Could Not Find Account with ID: ${accountId}`;
      error.code = 'INVALID_ACCOUNT_ID';
      const serializedErr = serializeError(error);
      this.logger.error(
        `[CREATE_CONTACT] :: ERROR : Account Reference Dose Not Exist :  ${JSON.stringify(
          serializedErr,
        )}`,
      );
      throw error;
    }

    // Find Contact if Exist (id dedupe check)
    if (contact && contact.id) {
      if (
        contact.stage === 'Ready' ||
        contact.stage === 'Delivered' ||
        contact.stage === 'Compliance'
      ) {
        const error = new Error();
        error.message = `Could Not Edit Contact`;
        error.code = 'CONTACT_NOT_EDITED';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[CREATE_CONTACT] :: ERROR : ${JSON.stringify(error)}`,
        );
        throw serializedErr;
      }

      // update Contact
      const updatedContactInstance = await this.updateContact(contact);

      this.logger.info(
        `[CREATE_CONTACT] :: Contact Updated,  contactId : ${updatedContactInstance.id}`,
      );

      // get all Duplicates of current contact
      const duplicateContacts = await Contact.findAll({
        where: { duplicateOf: contact.id },
        include: [
          {
            model: Account,
            where: [
              {
                ProjectId: contact.ProjectId,
              },
            ],
            attributes: ['name'],
          },
        ],
      });

      // re-check and update all duplicate references
      const duplicateReferenceCount = duplicateContacts.length;
      if (duplicateReferenceCount) {
        for (let counter = 0; counter < duplicateReferenceCount; counter += 1) {
          const duplicateContactReference = duplicateContacts[counter];

          duplicateContactReference.companyName =
            duplicateContactReference.Account.name;
          duplicateContactReference.ProjectId = contact.ProjectId;

          const { labeledContact: reEvaluatedContactReference } =
            // eslint-disable-next-line no-await-in-loop
            await this.contactCheckService.check(duplicateContactReference);
          // eslint-disable-next-line no-await-in-loop
          await this.updateContact(reEvaluatedContactReference);
        }
      }

      return updatedContactInstance.id;
    }

    // create new Contact
    const newCreatedContact = await this.createContact(contact);
    this.logger.info(
      `[CONTACT IMPORT] :: Contact Created with Id : ${newCreatedContact.id}`,
    );
    return newCreatedContact.id;
  }
}

module.exports = ContactSaveService;
