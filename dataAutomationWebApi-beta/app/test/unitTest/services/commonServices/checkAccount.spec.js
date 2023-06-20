const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');
const {
  expect
} = chai;
const {
  loggerMock
} = require('../../../helper');


// Build Mock For Dependant Services 
const settingsConfig = {
  logger: loggerMock,
  config: {}
};

const accountFinderInstanceStub = {
  findAccount: sinon.stub(),
};
const duplicateCheckerInstanceStub = {
  findAccountDuplicate: sinon.stub(),
};
const suppressionCheckerInstanceStub = {
  findAccountSuppression: sinon.stub(),
};

let accountFinderStub = sinon.stub().returns(accountFinderInstanceStub);
let duplicateCheckerStub = sinon.stub().returns(duplicateCheckerInstanceStub);
let suppressionCheckerStub = sinon.stub().returns(suppressionCheckerInstanceStub);

// Bind Mock to Actual Service 
const CheckAccountService = proxyquire('../../../../services/commonServices/checkAccount', {
  '../../config/settings/settings-config': settingsConfig,
  './accountFinder': accountFinderStub,
  './duplicateChecker': duplicateCheckerStub,
  './suppressionChecker': suppressionCheckerStub,
});

const checkAccountService = new CheckAccountService();

describe('#checkAccount - check', () => {
  describe('Return an Account with Duplicate And Suppression Result Of Given Account', () => {

    context('Check For Account exists in database or not', () => {
      it('Should return a error `BAD_ACCOUNT_ID` with `Could Not Find Account with ID: 6087dc463e5c26006f114ddd`, Account Reference Dose Not Exist` ', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const optionsDTO = {
          checkSuppression: true,
          checkDuplicate: true
        };
        const expectedError = {
          code: 'BAD_ACCOUNT_ID',
          message: 'Could Not Find Account with ID: 6087dc463e5c26006f114ddd, Account Reference Dose Not Exist'
        }
        accountFinderInstanceStub.findAccount.returns(null);

        //Act
        checkAccountService
          .check(accountDTO, optionsDTO)
          .then((result) => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data',
            );
            done(error);
          })
          .catch((error) => {
            const actualError = error;

            // Assert
            expect(actualError.code).to.equal(
              expectedError.code,
              'Error Code Does Not Match',
            );
            expect(actualError.message).to.equal(
              expectedError.message,
              'Error Code Does Not Match',
            );

            done(null);
          })
          .catch((error) => {
            done(error);
          })
      });
    });

    context('Check the given account is duplicate', () => {
      it('should return duplicateCheckResult', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const optionsDTO = {
          checkSuppression: false,
          checkDuplicate: true
        };
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
        };
        const duplicateAccountInstance = {
          id: '8760dc463e5c26006f114eee',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
        };
        const duplicateCheckResult = {
          isDuplicate: true,
          duplicateMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          duplicateWith: duplicateAccountInstance,
        };
        const suppressionCheckFinalResult = {
          isSuppressed: false,
          suppressionMatchCase: "NONE",
          suppressedWith: null,
        };
        const labeledAccount = {
          duplicateOf: "8760dc463e5c26006f114eee",
          id: "6087dc463e5c26006f114ddd",
          label: "duplicate"
        }
        const expectedResult = {
          labeledAccount: labeledAccount,
          duplicateCheckResult,
          suppressionCheckResult: suppressionCheckFinalResult,
        }

        accountFinderInstanceStub.findAccount.returns(accountInstance);
        duplicateCheckerInstanceStub.findAccountDuplicate.returns(duplicateCheckResult);

        //Act
        checkAccountService
          .check(accountDTO, optionsDTO)
          .then((result) => {
            const actualResult = result;

            //Assert
            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch((error) => {
            done(error);
          })
      });

      it('should return `DEDUPE_CHECK_ERROR` with `Could Not Check Account, Something Went wrong while Dedupe Check` ', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const optionsDTO = {
          checkSuppression: false,
          checkDuplicate: true
        };
        const duplicateAccountInstance = {
          id: '8760dc463e5c26006f114eee',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
        };
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
        };
        const duplicateCheckResult = {
          isDuplicate: true,
          duplicateMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          duplicateWith: duplicateAccountInstance,
        };
        const expectedError = {
          code: 'DEDUPE_CHECK_ERROR',
          desc: 'Could Not Check Account, Something Went wrong while Dedupe Check'
        }

        accountFinderInstanceStub.findAccount.returns(accountInstance);
        duplicateCheckerInstanceStub.findAccountDuplicate.throws(new Error());

        //Act
        checkAccountService
          .check(accountDTO, optionsDTO)
          .catch((error) => {
            const actualError = error;

            // Assert
            expect(actualError.code).to.equal(
              expectedError.code,
              'Error Code Does Not Match',
            );
            expect(actualError.desc).to.equal(
              expectedError.desc,
              'Error Code Does Not Match',
            );

            done(null);
          })
          .catch((error) => {
            done(error);
          })
      });
    });

    context('Check the given account is suppressed', () => {
      it('should return suppressionCheckResult', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const optionsDTO = {
          checkSuppression: true,
          checkDuplicate: false
        };
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'abelsontaylor',
          website: 'www.abelsontaylor.com',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          nsId: null,
          phoneHQ: '',
          linkedInUrl: null
        };
        const suppressedAccountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'abelsontaylor',
          website: 'www.abelsontaylor.com',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          nsId: null,
          phoneHQ: '',
          linkedInUrl: null
        };
        const suppressionCheckResult = {
          isSuppressed: true,
          suppressionMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          suppressedWith: suppressedAccountInstance,
        };
        const labeledAccount = {
          id: "6087dc463e5c26006f114ddd",
          label: "suppressed"
        }
        const duplicateCheckFinalResult = {
          isDuplicate: false,
          duplicateMatchCase: "NONE",
          duplicateWith: null,
        };
        const expectedResult = {
          labeledAccount: labeledAccount,
          duplicateCheckResult: duplicateCheckFinalResult,
          suppressionCheckResult,
        }

        accountFinderInstanceStub.findAccount.returns(accountInstance);
        suppressionCheckerInstanceStub.findAccountSuppression.returns(suppressionCheckResult);

        //Act
        checkAccountService
          .check(accountDTO, optionsDTO)
          .then((result) => {
            const actualResult = result;

            //Assert
            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch((error) => {
            done(error);
          })
      });

      it('should return `SUPPRESSION_CHECK_ERROR` with `Could Not Check Account, Something Went wrong while Suppression Check` ', (done) => {
        //Arrange 
        const accountDTO = {
          id: '6087dc463e5c26006f114ddd'
        };
        const optionsDTO = {
          checkSuppression: true,
          checkDuplicate: false
        };
        const accountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'abelsontaylor',
          website: 'www.abelsontaylor.com',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          nsId: null,
          phoneHQ: '',
          linkedInUrl: null
        };
        const suppressedAccountInstance = {
          id: '6087dc463e5c26006f114ddd',
          name: 'abelsontaylor',
          website: 'www.abelsontaylor.com',
          domain: 'abelsontaylor.com',
          scrubbedName: 'abelsontaylor',
          aliasName: 'abelsontaylor',
          tokens: 'abelsontaylor',
          nsId: null,
          phoneHQ: '',
          linkedInUrl: null
        };
        const suppressionCheckResult = {
          isSuppressed: true,
          suppressionMatchCase: 'WEBSITE_DOMAIN' + 'SCRUBBED_COMPANY_NAME' + 'COMPANY_ALIAS_NAME' + 'TOKENS',
          suppressedWith: suppressedAccountInstance,
        };
        const expectedError = {
          code: 'SUPPRESSION_CHECK_ERROR',
          desc: 'Could Not Check Account, Something Went wrong while Suppression Check'
        }

        accountFinderInstanceStub.findAccount.returns(accountInstance);
        suppressionCheckerInstanceStub.findAccountSuppression.throws(new Error());

        //Act
        checkAccountService
          .check(accountDTO, optionsDTO)
          .catch((error) => {
            const actualError = error;

            // Assert
            expect(actualError.code).to.equal(
              expectedError.code,
              'Error Code Does Not Match',
            );
            expect(actualError.desc).to.equal(
              expectedError.desc,
              'Error Code Does Not Match',
            );

            done(null);
          })
          .catch((error) => {
            done(error);
          })
      });
    });
  });
});