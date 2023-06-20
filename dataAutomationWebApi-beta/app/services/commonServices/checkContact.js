/* eslint-disable global-require */
const _ = require('lodash');
const { serializeError } = require('serialize-error');
const settingsConfig = require('../../config/settings/settings-config');
const { buildDedupeKeys } = require('./buildDedupeKeys');

class ContactCheckService {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;

    const DuplicateChecker = require('./duplicateChecker');
    this.duplicateChecker = new DuplicateChecker();

    const SuppressionChecker = require('./suppressionChecker');
    this.suppressionChecker = new SuppressionChecker();

    const ContactFinder = require('./contactFinder');
    this.contactFinder = new ContactFinder();
  }

  // Method
  async check(_contact, options) {
    const contact = _.cloneDeep(_contact);
    const { checkSuppression = true, checkDuplicate = true } = options || {};

    // dummy results
    let duplicateCheckFinalResult = {
      isDuplicate: false,
      duplicateMatchCase: this.config.contactDuplicateMatchCases.NONE,
      duplicateWith: null,
    };

    let suppressionCheckFinalResult = {
      isSuppressed: false,
      suppressionMatchCase: this.config.contactSuppressionMatchCases.NONE,
      suppressedWith: null,
      isFuzzySuppressed: false,
      fuzzyMatchCase: this.config.contactSuppressionMatchCases.NONE,
      fuzzyMatches: null,
    };

    // if contact already exist then
    // check if there is need to regenerate dedupe keys
    if (contact.id) {
      const existingContactInstance = await this.contactFinder.findContact(
        contact.id,
      );

      if (existingContactInstance === null) {
        const error = new Error();
        error.message = `Could Not Find Contact with ID: ${contact.id}, Contact Reference Dose Not Exist`;
        error.code = 'BAD_CONTACT_ID';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[CONTACT_CHECK_SERVICE] :: ERROR : Contact Reference Dose Not Exist :  ${JSON.stringify(
            serializedErr,
          )}`,
        );
        throw error;
      }
    }

    // if new contact is being checked then generate dedupe key and check
    this.logger.info(`[CONTACT_CHECK_SERVICE] :: Building.. Dedupe Keys`);

    const { fnLnCompany, fnLnDomain, fnLnPhone, emailName, emailDomain } =
      buildDedupeKeys(contact);

    this.logger.info(
      `[CONTACT_CHECK_SERVICE] :: Dedupe Keys : ${JSON.stringify({
        fnLnCompany,
        fnLnDomain,
        fnLnPhone,
        emailName,
        emailDomain,
      })}`,
    );

    // Inject Dedupe Keys
    contact.companyDedupeKey = fnLnCompany;
    contact.emailDedupeKey = fnLnDomain;
    contact.phoneDedupeKey = fnLnPhone;
    contact.emailNameDedupeKey = emailName;
    contact.emailDomainDedupeKey = emailDomain;

    let duplicateCheckResult;
    if (checkDuplicate) {
      try {
        // check Duplicate
        duplicateCheckResult = await this.duplicateChecker.findContactDuplicate(
          {
            contact,
          },
        );
        if (
          duplicateCheckResult &&
          duplicateCheckResult.isDuplicate &&
          _.get(duplicateCheckResult, 'duplicateWith.id', '') !==
            _.get(contact, 'id', null)
        ) {
          contact.label = this.config.objectLabels.DUPLICATE;
          duplicateCheckFinalResult = duplicateCheckResult;
          contact.duplicateOf = duplicateCheckResult.duplicateWith.id;
          return {
            labeledContact: contact,
            duplicateCheckResult: duplicateCheckFinalResult,
            suppressionCheckResult: suppressionCheckFinalResult,
          };
        }
        contact.duplicateOf = null;
      } catch (error) {
        error.code = 'DEDUPE_CHECK_ERROR';
        error.desc =
          'Could Not Check Contact, Something Went wrong while Dedupe Check';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[CONTACT_CHECK_SERVICE] :: ERROR : Could Not Check Contact Duplication :  ${JSON.stringify(
            serializedErr,
          )}`,
        );
        throw error;
      }
    }

    let suppressionCheckResult;
    if (checkSuppression) {
      try {
        // Check Suppression
        suppressionCheckResult =
          await this.suppressionChecker.findContactSuppression({ contact });
        // exact suppression match case
        if (_.get(suppressionCheckResult, 'isSuppressed', false)) {
          contact.label = this.config.objectLabels.SUPPRESSED;
          suppressionCheckFinalResult = suppressionCheckResult;
          return {
            labeledContact: contact,
            duplicateCheckResult: duplicateCheckFinalResult,
            suppressionCheckResult: suppressionCheckFinalResult,
          };
        }
        // fuzzy suppression match case
        if (_.get(suppressionCheckResult, 'isFuzzySuppressed', false)) {
          contact.label = this.config.objectLabels.FUZZY_SUPPRESSED;
          suppressionCheckFinalResult = suppressionCheckResult;
          return {
            labeledContact: contact,
            duplicateCheckResult: duplicateCheckFinalResult,
            suppressionCheckResult: suppressionCheckFinalResult,
          };
        }
      } catch (error) {
        error.code = 'SUPPRESSION_CHECK_ERROR';
        error.desc =
          'Could Not Check Contact, Something Went wrong while Suppression Check';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[CONTACT_CHECK_SERVICE] :: ERROR : Could Not Check Contact Suppression :  ${JSON.stringify(
            serializedErr,
          )}`,
        );
        throw error;
      }
    }

    if (
      !duplicateCheckFinalResult.isDuplicate &&
      !suppressionCheckFinalResult.isSuppressed &&
      !suppressionCheckFinalResult.isFuzzySuppressed
    ) {
      contact.label = this.config.objectLabels.INCLUSION;
    }

    return {
      labeledContact: contact,
      duplicateCheckResult: duplicateCheckFinalResult,
      suppressionCheckResult: suppressionCheckFinalResult,
    };
  }
}

module.exports = ContactCheckService;
