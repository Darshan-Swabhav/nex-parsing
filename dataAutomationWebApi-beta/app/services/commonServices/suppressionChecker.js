const {
  SharedFileProject,
  AccountSuppression,
  ContactSuppression,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');
const _ = require('lodash');
const settingsConfig = require('../../config/settings/settings-config');

const { Op } = Sequelize;
class SuppressionChecker {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;
  }

  /**
   * Check Suppression For Account.
   * @param {Object} params - Arguments.
   * @param {Object} params.account - Account object.
   * @param {Object} params.options - Configuration Object.
   * @param {boolean} params.options.scrubbedName - use scrubbedName to find Suppression.
   * @param {boolean} params.options.domain - use domain to find Suppression.
   * @param {boolean} params.options.aliasName - use aliasName to find Suppression.
   * @param {boolean} params.options.tokens - use tokens to find Suppression.
   */
  async findAccountSuppression(params) {
    if (!params) {
      this.logger.debug(
        `[ACCOUNT SUPPRESSION CHECK] :: Could Not Find Params, Skipping Account Suppression Check`,
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

    const suppressionWhereClause = [];

    // 1.domain dedupe check
    if (account.domain && options.domain) {
      suppressionWhereClause.push({ domain: account.domain });
    }
    // 2.scrubbedName check
    if (account.scrubbedName && options.scrubbedName) {
      suppressionWhereClause.push({ scrubbedName: account.scrubbedName });
    }
    // 3.aliasName check
    if (account.aliasName && options.aliasName) {
      suppressionWhereClause.push({ aliasName: account.aliasName });
    }
    // 4.tokens check
    if (account.tokens && options.tokens) {
      suppressionWhereClause.push({ tokens: account.tokens });
    }

    const sharedFileLinkData = await SharedFileProject.findAll({
      where: {
        ProjectId: account.ProjectId,
      },
      attributes: ['SharedFileId'],
      raw: true,
    });
    const shareFileIds = _.map(sharedFileLinkData, 'SharedFileId');

    const accountInstance = await AccountSuppression.findOne({
      where: {
        [Op.or]: suppressionWhereClause,
        SharedFileId: shareFileIds,
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
      isSuppressed: true,
      suppressionMatchCase: this.config.accountSuppressionMatchCases.NONE,
      suppressedWith: accountInstance,
    };

    // find match case
    if (
      _.get(account, 'domain', 'account') ===
      _.get(accountInstance, 'domain', 'accountInstance')
    ) {
      result.suppressionMatchCase =
        this.config.accountSuppressionMatchCases.WEBSITE_DOMAIN;
    } else if (
      _.get(account, 'scrubbedName', 'account') ===
      _.get(accountInstance, 'scrubbedName', 'accountInstance')
    ) {
      result.suppressionMatchCase =
        this.config.accountSuppressionMatchCases.SCRUBBED_COMPANY_NAME;
    } else if (
      _.get(account, 'aliasName', 'account') ===
      _.get(accountInstance, 'aliasName', 'accountInstance')
    ) {
      result.suppressionMatchCase =
        this.config.accountSuppressionMatchCases.COMPANY_ALIAS_NAME;
    } else if (
      _.get(account, 'tokens', 'account') ===
      _.get(accountInstance, 'tokens', 'accountInstance')
    ) {
      result.suppressionMatchCase =
        this.config.accountSuppressionMatchCases.TOKENS;
    } else {
      this.logger.info(
        `[ACCOUNT SUPPRESSION CHECK] :: No Suppression Found For Account :: name: ${account.name}`,
      );
      result.isSuppressed = false;
      result.suppressedWith = null;
    }

    return result;
  }

  /**
   * @typedef {Object} ContactSuppressionCheckResult
   * @property {boolean} isSuppressed - exact match boolean
   * @property {string} suppressionMatchCase - exact match case
   * @property {Object|null} suppressedWith - exact matched contact
   * @property {boolean} isFuzzySuppressed - fuzzy match boolean
   * @property {string} fuzzyMatchCase - fuzzy match case
   * @property {Array|null} fuzzyMatches - list of  fuzzy matched contacts
   */

  /**
   * Check Suppression For Contact.
   * @param {Object} params - Arguments.
   * @param {Object} params.contact - Contact object.
   * @param {Object} params.options - Configuration Object.
   * @param {boolean} params.options.emailDedupeKey - use email domain dedupe key to find Suppression.
   * @param {boolean} params.options.phoneDedupeKey - use phone dedupe key to find Suppression.
   * @param {boolean} params.options.companyDedupeKey - use company dedupe key to find Suppression.
   * @param {boolean} params.options.email - use contact email to find Suppression.
   * @return {ContactSuppressionCheckResult} - ContactSuppressionCheckResult Objects.
   */
  async findContactSuppression(params) {
    if (!params) {
      this.logger.debug(
        `[CONTACT SUPPRESSION CHECK] :: Could Not Find Params, Skipping Contact Suppression Check`,
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
          fuzzyMatch: true,
        };

    const suppressionWhereClause = [];

    // 1.emailDedupeKey check
    if (contact.emailDedupeKey && options.emailDedupeKey) {
      suppressionWhereClause.push({ emailDedupeKey: contact.emailDedupeKey });
    }
    // 2.phoneDedupeKey check
    if (contact.phoneDedupeKey && options.phoneDedupeKey) {
      suppressionWhereClause.push({ phoneDedupeKey: contact.phoneDedupeKey });
    }
    // 3.companyDedupeKey check
    if (contact.companyDedupeKey && options.companyDedupeKey) {
      suppressionWhereClause.push({
        companyDedupeKey: contact.companyDedupeKey,
      });
    }
    // 4.email Check
    if (contact.email && options.email) {
      suppressionWhereClause.push({ email: contact.email });
    }

    // find all suppression file used by current project
    const sharedFileLinkData = await SharedFileProject.findAll({
      where: {
        ProjectId: contact.ProjectId,
      },
      attributes: ['SharedFileId'],
      raw: true,
    });
    const shareFileIds = _.map(sharedFileLinkData, 'SharedFileId');

    // search suppression query
    const contactInstance = await ContactSuppression.findOne({
      where: {
        [Op.or]: suppressionWhereClause,
        SharedFileId: shareFileIds,
      },
      attributes: [
        'id',
        'firstName',
        'middleName',
        'lastName',
        'email',
        'phone',
        'companyName',
        'emailDedupeKey',
        'phoneDedupeKey',
        'companyDedupeKey',
      ],
      raw: true,
    });

    const result = {
      isSuppressed: true,
      suppressionMatchCase: this.config.contactSuppressionMatchCases.NONE,
      suppressedWith: contactInstance,
      isFuzzySuppressed: false,
      fuzzyMatchCase: this.config.contactSuppressionMatchCases.NONE,
      fuzzyMatches: null,
    };

    if (
      _.get(contact, 'email', 'contact') ===
      _.get(contactInstance, 'email', 'contactInstance')
    ) {
      result.suppressionMatchCase =
        this.config.contactSuppressionMatchCases.EMAIL;
    } else if (
      _.get(contact, 'emailDedupeKey', 'contact') ===
      _.get(contactInstance, 'emailDedupeKey', 'contactInstance')
    ) {
      result.suppressionMatchCase =
        this.config.contactSuppressionMatchCases.FN_LN_EMAIL_DOMAIN;
    } else if (
      _.get(contact, 'phoneDedupeKey', 'contact') ===
      _.get(contactInstance, 'phoneDedupeKey', 'contactInstance')
    ) {
      result.suppressionMatchCase =
        this.config.contactSuppressionMatchCases.FN_LN_PHONE;
    } else if (
      _.get(contact, 'companyDedupeKey', 'contact') ===
      _.get(contactInstance, 'companyDedupeKey', 'contactInstance')
    ) {
      result.suppressionMatchCase =
        this.config.contactSuppressionMatchCases.FN_LN_COMPANY;
    } else {
      this.logger.info(
        `[CONTACT SUPPRESSION CHECK] :: No Exact Suppression Found For Contact :: name: '${contact.firstName} ${contact.lastName}'`,
      );
      result.isSuppressed = false;
      result.suppressedWith = null;
    }

    if (result.isSuppressed) {
      this.logger.info(
        `[CONTACT SUPPRESSION CHECK] :: Exact Suppression Found For Contact :: ${JSON.stringify(
          result,
        )}`,
      );
      return result;
    }

    // Fuzzy Suppression Check;
    // build lastName like Query clause
    const lastName = _.trim(_.get(contact, 'lastName', ''));
    const emailDomain = _.trim(_.get(contact, 'emailDomainDedupeKey', ''));
    const shouldCheckLastNameFuzzyMatch = !!lastName && !!emailDomain;
    const lastNameLikeClause = `%${lastName}%`;

    if (options.fuzzyMatch && shouldCheckLastNameFuzzyMatch) {
      const lastNameFuzzyMatches = await ContactSuppression.findAll({
        where: {
          emailNameDedupeKey: {
            [Op.iLike]: lastNameLikeClause,
          },
          emailDomainDedupeKey: emailDomain,
          SharedFileId: shareFileIds,
        },
        attributes: [
          'id',
          'firstName',
          'middleName',
          'lastName',
          'email',
          'emailDomainDedupeKey',
          'emailNameDedupeKey',
        ],
        raw: true,
      });

      if (!_.isEmpty(lastNameFuzzyMatches)) {
        result.isFuzzySuppressed = true;
        result.fuzzyMatches = lastNameFuzzyMatches;
        result.fuzzyMatchCase =
          this.config.contactSuppressionMatchCases.LN_EMAIL_DOMAIN;
        this.logger.info(
          `[CONTACT SUPPRESSION CHECK] :: Fuzzy Suppression Found For Contact :: ${JSON.stringify(
            result,
          )}'`,
        );
        return result;
      }
    }

    // build firstName like Query clause
    const firstName = `${_.get(contact, 'firstName', '')}`.trim();
    const shouldCheckFirstNameFuzzyMatch = !!firstName && !!emailDomain;
    const firstNameLikeClause = `%${firstName}%`;

    if (options.fuzzyMatch && shouldCheckFirstNameFuzzyMatch) {
      const firstNameFuzzyMatches = await ContactSuppression.findAll({
        where: {
          emailNameDedupeKey: {
            [Op.iLike]: firstNameLikeClause,
          },
          emailDomainDedupeKey: emailDomain,
          SharedFileId: shareFileIds,
        },
        attributes: [
          'id',
          'firstName',
          'middleName',
          'lastName',
          'email',
          'emailDomainDedupeKey',
          'emailNameDedupeKey',
        ],
        raw: true,
      });

      if (!_.isEmpty(firstNameFuzzyMatches)) {
        result.isFuzzySuppressed = true;
        result.fuzzyMatches = firstNameFuzzyMatches;
        result.fuzzyMatchCase =
          this.config.contactSuppressionMatchCases.FN_EMAIL_DOMAIN;
        this.logger.info(
          `[CONTACT SUPPRESSION CHECK] :: Fuzzy Suppression Found For Contact :: ${JSON.stringify(
            result,
          )}'`,
        );
        return result;
      }
    }

    this.logger.info(
      `[CONTACT SUPPRESSION CHECK] :: No Fuzzy Suppression Found For Contact :: name: '${contact.firstName} ${contact.lastName}'`,
    );

    return result;
  }
}

module.exports = SuppressionChecker;
