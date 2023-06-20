const {
  Account,
  Contact,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const { Op } = Sequelize;
const _ = require('lodash');
const settingsConfig = require('../../config/settings/settings-config');

class DuplicateChecker {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;
  }

  /**
   * Check Dedupe For Account.
   * @param {Object} params - Arguments.
   * @param {Object} params.account - Account object.
   * @param {Object} params.options - Configuration Object.
   * @param {boolean} params.options.scrubbedName - use scrubbedName to find Duplicate.
   * @param {boolean} params.options.domain - use domain to find Duplicate.
   * @param {boolean} params.options.aliasName - use aliasName to find Duplicate.
   * @param {boolean} params.options.tokens - use tokens to find Duplicate.
   */
  async findAccountDuplicate(params) {
    if (!params) {
      this.logger.debug(
        `[ACCOUNT DEDUPE CHECK] :: Could Not Find Params, Skipping Account Duplicate Check`,
      );
      return false;
    }

    const account = Object.prototype.hasOwnProperty.call(params, 'account')
      ? params.account
      : {};
    const options = Object.prototype.hasOwnProperty.call(params, 'options')
      ? params.options
      : {
          scrubbedName: true,
          domain: true,
          aliasName: true,
          tokens: true,
        };

    const dedupeWhereClause = [];

    // 1.domain dedupe check
    if (account.domain && options.domain) {
      dedupeWhereClause.push({ domain: account.domain });
    }
    // 2.scrubbedName check
    if (account.scrubbedName && options.scrubbedName) {
      dedupeWhereClause.push({ scrubbedName: account.scrubbedName });
    }
    // 3.aliasName check
    if (account.aliasName && options.aliasName) {
      dedupeWhereClause.push({ aliasName: account.aliasName });
    }
    // 4.tokens check
    if (account.tokens && options.tokens) {
      dedupeWhereClause.push({ tokens: account.tokens });
    }

    // query
    const accountInstance = await Account.findOne({
      where: {
        [Op.or]: dedupeWhereClause,
        ProjectId: account.ProjectId,
        id: { [Op.ne]: account.id || '' },
        duplicateOf: {
          [Op.eq]: null,
        },
      },
      attributes: [
        'id',
        'name',
        'website',
        'domain',
        'nsId',
        'phoneHQ',
        'linkedInUrl',
        'scrubbedName',
        'aliasName',
        'tokens',
      ],
      raw: true,
    });

    const result = {
      isDuplicate: true,
      duplicateMatchCase: this.config.accountDuplicateMatchCases.NONE,
      duplicateWith: accountInstance,
    };

    // find match case
    if (
      _.get(account, 'domain', 'account') ===
      _.get(accountInstance, 'domain', 'accountInstance')
    ) {
      result.duplicateMatchCase =
        this.config.accountDuplicateMatchCases.WEBSITE_DOMAIN;
    } else if (
      _.get(account, 'scrubbedName', 'account') ===
      _.get(accountInstance, 'scrubbedName', 'accountInstance')
    ) {
      result.duplicateMatchCase =
        this.config.accountDuplicateMatchCases.SCRUBBED_COMPANY_NAME;
    } else if (
      _.get(account, 'aliasName', 'account') ===
      _.get(accountInstance, 'aliasName', 'accountInstance')
    ) {
      result.duplicateMatchCase =
        this.config.accountDuplicateMatchCases.COMPANY_ALIAS_NAME;
    } else if (
      _.get(account, 'tokens', 'account') ===
      _.get(accountInstance, 'tokens', 'accountInstance')
    ) {
      result.duplicateMatchCase = this.config.accountDuplicateMatchCases.TOKENS;
    } else {
      this.logger.info(
        `[ACCOUNT DEDUPE CHECK] :: No Duplicate Found For Account :: name: ${account.name}`,
      );
      result.isDuplicate = false;
      result.duplicateWith = null;
    }

    return result;
  }

  /**
   * Check Dedupe For Contact.
   * @param {Object} params - Arguments.
   * @param {Object} params.contact - Contact object.
   * @param {Object} params.options - Configuration Object.
   * @param {boolean} params.options.emailDedupeKey - use email domain dedupe key to find Duplicate.
   * @param {boolean} params.options.phoneDedupeKey - use phone dedupe key to find Duplicate.
   * @param {boolean} params.options.companyDedupeKey - use company dedupe key to find Duplicate.
   * @param {boolean} params.options.email - use email to find Duplicate.
   */
  async findContactDuplicate(params) {
    if (!params) {
      this.logger.debug(
        `[CONTACT DEDUPE CHECK] :: Could Not Find Params, Skipping Contact Duplicate Check`,
      );
      return false;
    }
    const contact = Object.prototype.hasOwnProperty.call(params, 'contact')
      ? params.contact
      : {};
    const options = Object.prototype.hasOwnProperty.call(params, 'options')
      ? params.options
      : {
          emailDedupeKey: true,
          phoneDedupeKey: true,
          companyDedupeKey: true,
          email: true,
        };

    const dedupeWhereClause = [];
    // 1.emailDedupeKey check
    if (contact.emailDedupeKey && options.emailDedupeKey) {
      dedupeWhereClause.push({ emailDedupeKey: contact.emailDedupeKey });
    }
    // 2.phoneDedupeKey check
    if (contact.phoneDedupeKey && options.phoneDedupeKey) {
      dedupeWhereClause.push({ phoneDedupeKey: contact.phoneDedupeKey });
    }
    // 3.companyDedupeKey check
    if (contact.companyDedupeKey && options.companyDedupeKey) {
      dedupeWhereClause.push({ companyDedupeKey: contact.companyDedupeKey });
    }
    // 4.email Check
    if (contact.email && options.email) {
      dedupeWhereClause.push({ email: contact.email });
    }

    const contactInstance = await Contact.findOne({
      where: {
        [Op.or]: dedupeWhereClause,
        duplicateOf: {
          [Op.eq]: null,
        },
        id: { [Op.ne]: contact.id || '' },
      },
      attributes: [
        'id',
        'firstName',
        'middleName',
        'lastName',
        'email',
        'phone',
        'duplicateOf',
        'emailDedupeKey',
        'phoneDedupeKey',
        'companyDedupeKey',
      ],
      include: [
        {
          model: Account,
          where: [
            {
              ProjectId: contact.ProjectId,
            },
          ],
          attributes: [['name', 'CompanyName']],
        },
      ],
      raw: true,
    });

    const result = {
      isDuplicate: true,
      duplicateMatchCase: this.config.contactDuplicateMatchCases.NONE,
      duplicateWith: contactInstance,
    };

    if (
      _.get(contact, 'email', 'contact') ===
      _.get(contactInstance, 'email', 'contactInstance')
    ) {
      result.duplicateMatchCase = this.config.contactDuplicateMatchCases.EMAIL;
    } else if (
      _.get(contact, 'emailDedupeKey', 'contact') ===
      _.get(contactInstance, 'emailDedupeKey', 'contactInstance')
    ) {
      result.duplicateMatchCase =
        this.config.contactDuplicateMatchCases.FN_LN_EMAIL_DOMAIN;
    } else if (
      _.get(contact, 'phoneDedupeKey', 'contact') ===
      _.get(contactInstance, 'phoneDedupeKey', 'contactInstance')
    ) {
      result.duplicateMatchCase =
        this.config.contactDuplicateMatchCases.FN_LN_PHONE;
    } else if (
      _.get(contact, 'companyDedupeKey', 'contact') ===
      _.get(contactInstance, 'companyDedupeKey', 'contactInstance')
    ) {
      result.duplicateMatchCase =
        this.config.contactDuplicateMatchCases.FN_LN_COMPANY;
    } else {
      this.logger.info(
        `[CONTACT DEDUPE CHECK] :: No Duplicate Found For Contact :: name: '${contact.firstName} ${contact.lastName}'`,
      );
      result.isDuplicate = false;
      result.duplicateWith = null;
    }
    return result;
  }
}

module.exports = DuplicateChecker;
