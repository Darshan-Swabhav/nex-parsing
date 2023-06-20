/* eslint-disable global-require */
const _ = require('lodash');
const { serializeError } = require('serialize-error');
const {
  LABELS,
} = require('@nexsalesdev/dataautomation-datamodel/lib/services/constants');
const settingsConfig = require('../../config/settings/settings-config');

class AccountCheckService {
  constructor() {
    this.config = settingsConfig.settings || {};
    this.logger = settingsConfig.logger || console;

    const Sanitizer = require('./sanitizer');
    this.sanitizer = new Sanitizer();

    const DuplicateChecker = require('./duplicateChecker');
    this.duplicateChecker = new DuplicateChecker();

    const SuppressionChecker = require('./suppressionChecker');
    this.suppressionChecker = new SuppressionChecker();

    const AccountFinder = require('./accountFinder');
    this.accountFinder = new AccountFinder();
  }

  // Method
  async check(_account, options) {
    const account = _.cloneDeep(_account);
    const { checkSuppression = true, checkDuplicate = true } = options || {};

    // dummy results
    const duplicateCheckFinalResult = {
      isDuplicate: false,
      duplicateMatchCase: this.config.accountDuplicateMatchCases.NONE,
      duplicateWith: null,
    };

    const suppressionCheckFinalResult = {
      isSuppressed: false,
      suppressionMatchCase: this.config.accountDuplicateMatchCases.NONE,
      suppressedWith: null,
    };

    // if account already exist, check if the account exist
    if (account.id) {
      const existingAccountInstance = await this.accountFinder.findAccount(
        account.id,
      );

      if (existingAccountInstance === null) {
        const error = new Error();
        error.message = `Could Not Find Account with ID: ${account.id}, Account Reference Dose Not Exist`;
        error.code = 'BAD_ACCOUNT_ID';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[ACCOUNT_CHECK_SERVICE] :: ERROR : Account Reference Dose Not Exist :  ${JSON.stringify(
            serializedErr,
          )}`,
        );
        throw error;
      }
    }

    let duplicateCheckResult;
    if (checkDuplicate) {
      try {
        // check duplicate
        duplicateCheckResult = await this.duplicateChecker.findAccountDuplicate(
          { account },
        );

        if (
          duplicateCheckResult &&
          duplicateCheckResult.isDuplicate &&
          duplicateCheckResult.duplicateWith.id !== account.id
        ) {
          account.label = LABELS.DUPLICATE;
          account.duplicateOf = duplicateCheckResult.duplicateWith.id;

          return {
            labeledAccount: account,
            duplicateCheckResult,
            suppressionCheckResult: suppressionCheckFinalResult,
          };
        }
        account.duplicateOf = null;
      } catch (error) {
        error.code = 'DEDUPE_CHECK_ERROR';
        error.desc =
          'Could Not Check Account, Something Went wrong while Dedupe Check';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[ACCOUNT_CHECK_SERVICE] :: ERROR : Could Not Check Account Duplication :  ${JSON.stringify(
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
          await this.suppressionChecker.findAccountSuppression({ account });

        if (suppressionCheckResult && suppressionCheckResult.isSuppressed) {
          account.label = LABELS.SUPPRESSED;
          return {
            labeledAccount: account,
            duplicateCheckResult: duplicateCheckFinalResult,
            suppressionCheckResult,
          };
        }
      } catch (error) {
        error.code = 'SUPPRESSION_CHECK_ERROR';
        error.desc =
          'Could Not Check Account, Something Went wrong while Suppression Check';
        const serializedErr = serializeError(error);
        this.logger.error(
          `[ACCOUNT_CHECK_SERVICE] :: ERROR : Could Not Check Account Suppression :  ${JSON.stringify(
            serializedErr,
          )}`,
        );
        throw error;
      }
    }

    if (
      !duplicateCheckFinalResult.isDuplicate &&
      !suppressionCheckFinalResult.isSuppressed
    ) {
      account.label = 'inclusion';
    }

    return {
      labeledAccount: account,
      duplicateCheckResult: duplicateCheckFinalResult,
      suppressionCheckResult: suppressionCheckFinalResult,
    };
  }
}

module.exports = AccountCheckService;
