const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');
const { expect } = chai;
const { inspect } = require('util');
const { loggerMock } = require('../../../helper');
const {
  SharedFileProject,
  AccountSuppression,
  ContactSuppression,
  Sequelize
} = require('@nexsalesdev/dataautomation-datamodel');
const { Op } = Sequelize;

// Build Mock For Dependant Services
const settingsConfig = {
  logger: loggerMock,
  config: {}
};

// Bind Mock to Actual Service
const SuppressionCheckerService = proxyquire(
  '../../../../services/commonServices/suppressionChecker',
  {
    '../../config/settings/settings-config': settingsConfig
  }
);
const suppressionCheckerService = new SuppressionCheckerService();

describe('#suppressionChecker - findAccountSuppression', () => {
  describe('Should Return A Suppressed Account', () => {
    beforeEach(() => {
      accountDTO = {
        id: '6087dc463e5c26006f114f2e',
        name: 'LifeCare Assurance Company',
        website: 'abc.com',
        nsId: 'nsId1',
        phoneHQ: 'phone1',
        linkedInUrl: 'hc@linkedin.in',
        scrubbedName: '',
        domain: '',
        aliasName: '',
        tokens: '',
        ProjectId: '01'
      };
      params = {
        account: accountDTO
      };

      sharedFileProjectFindAllInput = {
        where: {
          ProjectId: accountDTO.ProjectId
        },
        attributes: ['SharedFileId'],
        raw: true
      };
      sharedFileProjectFindAllOutput = [
        {
          SharedFileId: '06687a7e-4444-46ce-837c-935eaf319b4a'
        },
        {
          SharedFileId: '419b561a-1111-4e38-a64b-30507667affd'
        },
        {
          SharedFileId: '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
        }
      ];

      accountSuppressionFindOneInput = {
        where: {},
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
          'tokens'
        ],
        raw: true
      };
      accountSuppressionFindOneOutput = {
        id: '6087dc463e5c26006f114f2e',
        name: 'LifeCare Assurance Company',
        website: 'abc.com',
        domain: 'lifecare.com',
        nsId: 'nsId1',
        phoneHQ: 'phone1',
        linkedInUrl: 'hc@linkedin.in',
        scrubbedName: 'lifecare assurance',
        aliasName: 'lifecareAssurance',
        tokens: 'lifecare|assurance'
      };

      expectedResult = {
        isSuppressed: true,
        suppressionMatchCase: '',
        suppressedWith: accountSuppressionFindOneOutput
      };

      //stub
      sharedFileProjectFindAll = sinon.stub(SharedFileProject, 'findAll');
      accountSuppressionFindOne = sinon.stub(AccountSuppression, 'findOne');
    });

    afterEach(() => {
      //restore
      sharedFileProjectFindAll.restore();
      accountSuppressionFindOne.restore();
    });

    context('When no params are passed', () => {
      it('Should return a false', (done) => {
        //Arrange
        const _expectedResult = false;

        //Act
        suppressionCheckerService
          .findAccountSuppression()
          .then((response) => {
            const actualResult = response;

            expect(actualResult).to.equal(_expectedResult);
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Account Domain Is Passed', () => {
      it('Should return a suppressionMatchCase: WEBSITE_DOMAIN', (done) => {
        // Arrange
        accountDTO.domain = 'lifecare.com';

        suppressionWhereClause = [
          {
            domain: accountDTO.domain
          }
        ];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'WEBSITE_DOMAIN';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        accountSuppressionFindOne.returns(accountSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountSuppressionFindOneArgs =
              accountSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Account Suppression query part
            expect(
              inspect(accountSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(accountSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find account Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Account ScrubbedName Is Passed', () => {
      it('Should return a suppressionMatchCase: SCRUBBED_COMPANY_NAME', (done) => {
        // Arrange
        accountDTO.scrubbedName = 'lifecare assurance';

        suppressionWhereClause = [
          {
            scrubbedName: accountDTO.scrubbedName
          }
        ];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'SCRUBBED_COMPANY_NAME';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        accountSuppressionFindOne.returns(accountSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountSuppressionFindOneArgs =
              accountSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Account Suppression query part
            expect(
              inspect(accountSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(accountSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find account Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Account AliasName Is Passed', () => {
      it('Should return a suppressionMatchCase: COMPANY_ALIAS_NAME', (done) => {
        // Arrange
        accountDTO.aliasName = 'lifecareAssurance';

        suppressionWhereClause = [
          {
            aliasName: accountDTO.aliasName
          }
        ];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'COMPANY_ALIAS_NAME';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        accountSuppressionFindOne.returns(accountSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountSuppressionFindOneArgs =
              accountSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Account Suppression query part
            expect(
              inspect(accountSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(accountSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find account Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Account Tokens Is Passed', () => {
      it('Should return a suppressionMatchCase: TOKENS', (done) => {
        // Arrange
        accountDTO.tokens = 'lifecare|assurance';

        suppressionWhereClause = [
          {
            tokens: accountDTO.tokens
          }
        ];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'TOKENS';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        accountSuppressionFindOne.returns(accountSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountSuppressionFindOneArgs =
              accountSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Account Suppression query part
            expect(
              inspect(accountSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(accountSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find account Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Account Is Passed', () => {
      it('Should return a suppressionMatchCase: NONE', (done) => {
        // Arrange
        expectedResult.isSuppressed = false;
        expectedResult.suppressionMatchCase = 'NONE';
        expectedResult.suppressedWith = null;

        suppressionWhereClause = [];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        accountSuppressionFindOne.returns();

        // Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountSuppressionFindOneArgs =
              accountSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Account Suppression query part
            expect(
              inspect(accountSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(accountSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find account Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When sharedFileLinkData Sequelize Query Fails', () => {
      it('Should return a sequelize error', (done) => {
        //Arrange
        let expectedError = 'unexpected sequelize Query Error';

        suppressionWhereClause = [];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        //stub returns
        sharedFileProjectFindAll.throws(
          new Error('unexpected sequelize Query Error')
        );

        //Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then(() => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data'
            );
            done(error);
          })
          .catch((error) => {
            const actualErrMsg = error.message;

            expect(actualErrMsg).to.equal(
              expectedError,
              'Error Does Not Match'
            );
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When accountSuppressionFindOne Sequelize Query Fails', () => {
      it('Should return a sequelize error', (done) => {
        //Arrange
        let expectedError = 'unexpected sequelize Query Error';
        suppressionWhereClause = [];

        accountSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        accountSuppressionFindOne.throws(
          new Error('unexpected sequelize Query Error')
        );

        //Act
        suppressionCheckerService
          .findAccountSuppression(params)
          .then(() => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data'
            );
            done(error);
          })
          .catch((error) => {
            const actualErrMsg = error.message;

            expect(actualErrMsg).to.equal(
              expectedError,
              'Error Does Not Match'
            );
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });
  });
});

describe('#suppressionChecker - findContactSuppression', () => {
  //Exact Suppression
  describe('Should Return A Exact-ContactSuppression', () => {
    beforeEach(() => {
      contactDTO = {
        id: '6087dc463e5c26006f114f2o',
        firstName: 'Kelly',
        middleName: 'as',
        lastName: 'Timpson',
        email: '',
        phone: '9873456727',
        duplicateOf: '',
        emailDedupeKey: '',
        phoneDedupeKey: '',
        companyDedupeKey: '',
        ProjectId: '01'
      };

      sharedFileProjectFindAllInput = {
        where: {
          ProjectId: contactDTO.ProjectId
        },
        attributes: ['SharedFileId'],
        raw: true
      };
      sharedFileProjectFindAllOutput = [
        {
          SharedFileId: '06687a7e-4444-46ce-837c-935eaf319b4a'
        },
        {
          SharedFileId: '419b561a-1111-4e38-a64b-30507667affd'
        },
        {
          SharedFileId: '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
        }
      ];

      contactSuppressionFindOneInput = {
        where: {},
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
          'companyDedupeKey'
        ],
        raw: true
      };
      contactSuppressionFindOneOutput = {
        id: '9521dc463e5c26006f115g0u',
        firstName: 'Kelly',
        middleName: 'as',
        lastName: 'Timpson',
        phone: '9873456727',
        duplicateOf: '6087dc463e5c26006f114f2o',
        email: 'kelly.timpson@active.com',
        emailDedupeKey: 'kellytimpsonactivecom',
        phoneDedupeKey: 'kellytimpson9873456717',
        companyDedupeKey: 'kellytimpsonlifecareassurance'
      };

      expectedResult = {
        isSuppressed: true,
        suppressionMatchCase: '',
        suppressedWith: contactSuppressionFindOneOutput,
        isFuzzySuppressed: false,
        fuzzyMatchCase: 'NONE',
        fuzzyMatches: null
      };
      params = {
        contact: contactDTO
      };

      //stub
      sharedFileProjectFindAll = sinon.stub(SharedFileProject, 'findAll');
      contactSuppressionFindOne = sinon.stub(ContactSuppression, 'findOne');
    });

    afterEach(() => {
      //restore
      sharedFileProjectFindAll.restore();
      contactSuppressionFindOne.restore();
    });

    context('When no params is passed', () => {
      it('Should return a false', (done) => {
        //Arrange
        const _expectedResult = false;

        //Act
        suppressionCheckerService
          .findContactSuppression()
          .then((response) => {
            const actualResult = response;

            expect(actualResult).to.equal(_expectedResult);
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Is Passed With email', () => {
      it('Should return a suppressionMatchCase: EMAIL', (done) => {
        // Arrange
        contactDTO.email = 'kelly.timpson@active.com';

        suppressionWhereClause = [
          {
            email: contactDTO.email
          }
        ];

        contactSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'EMAIL';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns(contactSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Contact Suppression query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Is Passed With emailDedupeKey', () => {
      it('Should return a suppressionMatchCase: emailDedupeKey', (done) => {
        // Arrange
        contactDTO.emailDedupeKey = 'kellytimpsonactivecom';

        suppressionWhereClause = [
          {
            emailDedupeKey: contactDTO.emailDedupeKey
          }
        ];

        contactSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'FN+LN+EMAIL_DOMAIN';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns(contactSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Contact Suppression query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Is Passed With phoneDedupeKey', () => {
      it('Should return a suppressionMatchCase: phoneDedupeKey', (done) => {
        // Arrange
        contactDTO.phoneDedupeKey = 'kellytimpson9873456717';

        suppressionWhereClause = [
          {
            phoneDedupeKey: contactDTO.phoneDedupeKey
          }
        ];

        contactSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'FN+LN+PHONE';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns(contactSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Contact Suppression query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Is Passed With companyDedupeKey', () => {
      it('Should return a suppressionMatchCase: companyDedupeKey', (done) => {
        // Arrange
        contactDTO.companyDedupeKey = 'kellytimpsonlifecareassurance';

        suppressionWhereClause = [
          {
            companyDedupeKey: contactDTO.companyDedupeKey
          }
        ];

        contactSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        expectedResult.suppressionMatchCase = 'FN+LN+COMPANY';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns(contactSuppressionFindOneOutput);

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Contact Suppression query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Is Passed', () => {
      it('Should return a suppressionMatchCase: NONE', (done) => {
        // Arrange
        expectedResult.isSuppressed = false;
        expectedResult.suppressionMatchCase = 'NONE';
        expectedResult.suppressedWith = null;

        suppressionWhereClause = [];

        contactSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns();

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(sharedFileProjectFindAllArgs).to.deep.equal(
              sharedFileProjectFindAllInput,
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the Contact Suppression query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When sharedFileProjectFindAll Sequelize Query Fails', () => {
      it('Should return a sequelize error', (done) => {
        //Arrange
        let expectedError = 'unexpected sequelize Query Error';

        suppressionWhereClause = [];

        contactSuppressionFindOneInput.where = {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        };

        //stub returns
        sharedFileProjectFindAll.throws(
          new Error('unexpected sequelize Query Error')
        );

        //Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then(() => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data'
            );
            done(error);
          })
          .catch((error) => {
            const actualErrMsg = error.message;

            expect(actualErrMsg).to.equal(
              expectedError,
              'Error Does Not Match'
            );
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When contactSuppressionFindOne Sequelize Query Fails', () => {
      it('Should return a sequelize error', (done) => {
        //Arrange
        let expectedError = 'unexpected sequelize Query Error';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.throws(
          new Error('unexpected sequelize Query Error')
        );

        //Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then(() => {
            const error = new Error(
              'Expected Function to throw an Error But Got Data'
            );
            done(error);
          })
          .catch((error) => {
            const actualErrMsg = error.message;

            expect(actualErrMsg).to.equal(
              expectedError,
              'Error Does Not Match'
            );
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });
  });

  //Fuzzy Suppression
  describe('Should Return A Fuzzy-ContactSuppression', () => {
    beforeEach(() => {
      contactDTO = {
        id: '6087dc463e5c26006f114f2o',
        firstName: 'Timpson',
        middleName: 'as',
        lastName: '',
        email: 'kelly.timpson@active.com',
        phone: '9873456727',
        duplicateOf: '',
        emailDedupeKey: '',
        phoneDedupeKey: '',
        companyDedupeKey: '',
        ProjectId: '01',
        emailDomainDedupeKey: 'timpson@active.com'
      };
      suppressionWhereClause = [{ email: 'kelly.timpson@active.com' }];

      sharedFileProjectFindAllInput = {
        where: {
          ProjectId: contactDTO.ProjectId
        },
        attributes: ['SharedFileId'],
        raw: true
      };
      sharedFileProjectFindAllOutput = [
        {
          SharedFileId: '06687a7e-4444-46ce-837c-935eaf319b4a'
        },
        {
          SharedFileId: '419b561a-1111-4e38-a64b-30507667affd'
        },
        {
          SharedFileId: '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
        }
      ];

      contactSuppressionFindOneInput = {
        where: {
          [Op.or]: suppressionWhereClause,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
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
          'companyDedupeKey'
        ],
        raw: true
      };
      contactSuppressionFindOneOutput = {};

      contactSuppressionFindAllInput = {
        where: {
          emailNameDedupeKey: {
            [Op.iLike]: `%${contactDTO.firstName}%`
          },
          emailDomainDedupeKey: contactDTO.emailDomainDedupeKey,
          SharedFileId: [
            '06687a7e-4444-46ce-837c-935eaf319b4a',
            '419b561a-1111-4e38-a64b-30507667affd',
            '7f8a2a0a-5555-49b8-b440-b9cb3755d90a'
          ]
        },
        attributes: [
          'id',
          'firstName',
          'middleName',
          'lastName',
          'email',
          'emailDomainDedupeKey',
          'emailNameDedupeKey'
        ],
        raw: true
      };
      contactSuppressionFindAllOutput = [
        {
          id: '6087dc463e5c26006f114f2o',
          firstName: 'Kelly',
          middleName: 'as',
          lastName: 'Timpson',
          email: 'kelly.timpson@active.com',
          emailDomainDedupeKey: 'kelly@active.com',
          emailNameDedupeKey: 'kellyTimpson'
        },
        {
          id: '8710dc463e5c26006f1182b0',
          firstName: 'Kelly',
          middleName: '',
          lastName: 'Timpson',
          email: 'kelly.timpson@active.com',
          emailDomainDedupeKey: 'kelly@active.com',
          emailNameDedupeKey: 'kellyasTimpson'
        }
      ];

      expectedResult = {
        isSuppressed: false,
        suppressionMatchCase: 'NONE',
        suppressedWith: null,
        isFuzzySuppressed: true,
        fuzzyMatchCase: 'NONE',
        fuzzyMatches: contactSuppressionFindAllOutput
      };
      params = {
        contact: contactDTO
      };

      //stub
      sharedFileProjectFindAll = sinon.stub(SharedFileProject, 'findAll');
      contactSuppressionFindOne = sinon.stub(ContactSuppression, 'findOne');
      contactSuppressionFindAll = sinon.stub(ContactSuppression, 'findAll');
    });

    afterEach(() => {
      //restore
      sharedFileProjectFindAll.restore();
      contactSuppressionFindOne.restore();
      contactSuppressionFindAll.restore();
    });

    context('When Contact including lastName Is Passed', () => {
      it('Should return a fuzzyMatchCase: LN+EMAIL_DOMAIN', (done) => {
        // Arrange
        contactDTO.lastName = 'Timpson';
        expectedResult.fuzzyMatchCase = 'LN+EMAIL_DOMAIN';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns();
        contactSuppressionFindAll.returns(contactSuppressionFindAllOutput);

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const contactSuppressionFindAllArgs =
              contactSuppressionFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(
              inspect(sharedFileProjectFindAllArgs, { depth: null })
            ).to.deep.equal(
              inspect(sharedFileProjectFindAllInput, {
                depth: null
              }),
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the contactSuppressionFindOne query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression One from DB Query Differs'
            );

            //expect the contactSuppressionFindAll query part
            expect(
              inspect(contactSuppressionFindAllArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindAllInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression One from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact including firstName Is Passed', () => {
      it('Should return a fuzzyMatchCase: FN+EMAIL_DOMAIN', (done) => {
        // Arrange
        contactDTO.firstName = 'Timpson';
        expectedResult.fuzzyMatchCase = 'FN+EMAIL_DOMAIN';

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns();
        contactSuppressionFindAll.returns(contactSuppressionFindAllOutput);

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const contactSuppressionFindAllArgs =
              contactSuppressionFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(
              inspect(sharedFileProjectFindAllArgs, { depth: null })
            ).to.deep.equal(
              inspect(sharedFileProjectFindAllInput, {
                depth: null
              }),
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the contactSuppressionFindOne query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression One from DB Query Differs'
            );

            //expect the contactSuppressionFindAll query part
            expect(
              inspect(contactSuppressionFindAllArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindAllInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression One from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    context('When Contact Is Passed', () => {
      it('Should return a fuzzyMatchCase: NONE', (done) => {
        // Arrange
        contactDTO.firstName = 'Kelly';
        contactDTO.lastName = 'Timpson';

        expectedResult.isFuzzySuppressed = false;
        expectedResult.fuzzyMatches = null;

        //stub returns
        sharedFileProjectFindAll.returns(sharedFileProjectFindAllOutput);
        contactSuppressionFindOne.returns();
        contactSuppressionFindAll.returns();

        // Act
        suppressionCheckerService
          .findContactSuppression(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const sharedFileProjectFindAllArgs =
              sharedFileProjectFindAll.getCall(0).args[0];
            const contactSuppressionFindOneArgs =
              contactSuppressionFindOne.getCall(0).args[0];
            const contactSuppressionFindAllArgs =
              contactSuppressionFindAll.getCall(0).args[0];

            //expect the sharedFileProject query part
            expect(
              inspect(sharedFileProjectFindAllArgs, { depth: null })
            ).to.deep.equal(
              inspect(sharedFileProjectFindAllInput, {
                depth: null
              }),
              'Expected Query not executed for find sharedFile Project from DB Query Differs'
            );

            //expect the contactSuppressionFindOne query part
            expect(
              inspect(contactSuppressionFindOneArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindOneInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression One from DB Query Differs'
            );

            //expect the contactSuppressionFindAll query part
            expect(
              inspect(contactSuppressionFindAllArgs, { depth: null })
            ).to.deep.equal(
              inspect(contactSuppressionFindAllInput, {
                depth: null
              }),
              'Expected Query not executed for find contact Suppression One from DB Query Differs'
            );

            //expect the result
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });
  });
});
