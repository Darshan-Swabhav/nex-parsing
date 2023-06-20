const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');
const { expect } = chai;
const { inspect } = require('util');
const { loggerMock } = require('../../../helper');
const {
  Account,
  Contact,
  Sequelize
} = require('@nexsalesdev/dataautomation-datamodel');
const { Op } = Sequelize;

// Build Mock For Dependant Services
const settingsConfig = {
  logger: loggerMock,
  config: {}
};

// Bind Mock to Actual Service
const DuplicateCheckerService = proxyquire(
  '../../../../services/commonServices/duplicateChecker',
  {
    '../../config/settings/settings-config': settingsConfig
  }
);

const duplicateCheckerService = new DuplicateCheckerService();

describe('#duplicateChecker - findContactDuplicate', () => {
  describe('Returns a Duplicate Contact', () => {
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
      contactFindOneInput = {
        where: {},
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
          'companyDedupeKey'
        ],
        include: [
          {
            model: Account,
            where: [
              {
                ProjectId: contactDTO.ProjectId
              }
            ],
            attributes: [['name', 'CompanyName']]
          }
        ],
        raw: true
      };
      contactFindOneOutput = {
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
        isDuplicate: true,
        duplicateMatchCase: '',
        duplicateWith: contactFindOneOutput
      };
      params = {
        contact: contactDTO
      };

      //stub
      contactFindOne = sinon.stub(Contact, 'findOne');
    });

    afterEach(() => {
      //restore
      contactFindOne.restore();
    });

    context('When no params are passed', () => {
      it('Should return a false', (done) => {
        //Arrange
        const _expectedResult = false;

        //Act
        duplicateCheckerService
          .findContactDuplicate()
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

    context('When Contact Email Passed', () => {
      it('Should return a duplicateMatchCase: EMAIL', (done) => {
        // Arrange
        contactDTO.email = 'kelly.timpson@active.com';

        dedupeWhereClause = [
          {
            email: contactDTO.email
          }
        ];
        contactFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          duplicateOf: {
            [Op.eq]: null
          },
          id: {
            [Op.ne]: contactDTO.id || ''
          }
        };

        expectedResult.duplicateMatchCase = 'EMAIL';

        //stub returns
        contactFindOne.returns(contactFindOneOutput);

        // Act
        duplicateCheckerService
          .findContactDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactFindOneArgs = contactFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(contactFindOneArgs)).to.deep.equal(
              Object.keys(contactFindOneInput),
              'Expected Query length is not same equal to contactFindOne Input Query'
            );

            //expect the query part
            expect(inspect(contactFindOneArgs, { depth: null })).to.deep.equal(
              inspect(contactFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB Query Differs'
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

    context('When Contacts If emailDedupeKey Passed', () => {
      it('Should return a duplicateMatchCase: emailDedupeKey', (done) => {
        // Arrange
        contactDTO.emailDedupeKey = 'kellytimpsonactivecom';

        dedupeWhereClause = [
          {
            emailDedupeKey: contactDTO.emailDedupeKey
          }
        ];
        contactFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          duplicateOf: {
            [Op.eq]: null
          },
          id: {
            [Op.ne]: contactDTO.id || ''
          }
        };

        expectedResult.duplicateMatchCase = 'FN+LN+EMAIL_DOMAIN';

        //stub returns
        contactFindOne.returns(contactFindOneOutput);

        // Act
        duplicateCheckerService
          .findContactDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactFindOneArgs = contactFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(contactFindOneArgs).length).to.deep.equal(
              Object.keys(contactFindOneInput).length,
              'Expected Query length is not same equal to contactFindOne Input Query'
            );

            //expect the query
            expect(inspect(contactFindOneArgs, { depth: null })).to.deep.equal(
              inspect(contactFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB Query Differs'
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

    context('When Contacts If phoneDedupeKey Passed', () => {
      it('Should return a duplicateMatchCase: phoneDedupeKey', (done) => {
        // Arrange
        contactDTO.phoneDedupeKey = 'kellytimpson9873456717';

        dedupeWhereClause = [
          {
            phoneDedupeKey: contactDTO.phoneDedupeKey
          }
        ];

        contactFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          duplicateOf: {
            [Op.eq]: null
          },
          id: {
            [Op.ne]: contactDTO.id || ''
          }
        };

        expectedResult.duplicateMatchCase = 'FN+LN+PHONE';

        //stub returns
        contactFindOne.returns(contactFindOneOutput);

        // Act
        duplicateCheckerService
          .findContactDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactFindOneArgs = contactFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(contactFindOneArgs).length).to.deep.equal(
              Object.keys(contactFindOneInput).length,
              'Expected Query length is not same equal to contactFindOne Input Query'
            );

            //expect the query
            expect(inspect(contactFindOneArgs, { depth: null })).to.deep.equal(
              inspect(contactFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB Query Differs'
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

    context('When Contacts If companyDedupeKey Passed', () => {
      it('Should return a duplicateMatchCase: companyDedupeKey', (done) => {
        // Arrange
        contactDTO.companyDedupeKey = 'kellytimpsonlifecareassurance';

        dedupeWhereClause = [
          {
            companyDedupeKey: contactDTO.companyDedupeKey
          }
        ];

        contactFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          duplicateOf: {
            [Op.eq]: null
          },
          id: {
            [Op.ne]: contactDTO.id || ''
          }
        };

        expectedResult.duplicateMatchCase = 'FN+LN+COMPANY';

        //stub returns
        contactFindOne.returns(contactFindOneOutput);

        // Act
        duplicateCheckerService
          .findContactDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactFindOneArgs = contactFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(contactFindOneArgs).length).to.deep.equal(
              Object.keys(contactFindOneInput).length,
              'Expected Query length is not same equal to contactFindOne Input Query'
            );

            //expect the query
            expect(inspect(contactFindOneArgs, { depth: null })).to.deep.equal(
              inspect(contactFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB Query Differs'
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

    context('When Contacts If Passed', () => {
      it('Should return a duplicateMatchCase: NONE', (done) => {
        // Arrange
        expectedResult.isDuplicate = false;
        expectedResult.duplicateMatchCase = 'NONE';
        expectedResult.duplicateWith = null;

        dedupeWhereClause = [];

        contactFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          duplicateOf: {
            [Op.eq]: null
          },
          id: {
            [Op.ne]: contactDTO.id || ''
          }
        };

        //stub returns
        contactFindOne.returns();

        // Act
        duplicateCheckerService
          .findContactDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const contactFindOneArgs = contactFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(contactFindOneArgs).length).to.deep.equal(
              Object.keys(contactFindOneInput).length,
              'Expected Query length is not same equal to contactFindOne Input Query'
            );

            //expect the query
            expect(inspect(contactFindOneArgs, { depth: null })).to.deep.equal(
              inspect(contactFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find contact data from DB Query Differs'
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

describe('#duplicateChecker - findAccountDuplicate', () => {
  describe('Validates findAccountDuplicate', () => {
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
      accountFindOneInput = {
        where: {
          [Op.or]: dedupeWhereClause,
          ProjectId: accountDTO.ProjectId,
          id: {
            [Op.ne]: accountDTO.id || ''
          },
          duplicateOf: {
            [Op.eq]: null
          }
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
          'tokens'
        ],
        raw: true
      };
      accountFindOneOutput = {
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
        isDuplicate: true,
        duplicateMatchCase: '',
        duplicateWith: accountFindOneOutput
      };
      params = {
        account: accountDTO
      };

      //stub
      accountFindOne = sinon.stub(Account, 'findOne');
    });

    afterEach(() => {
      //restore
      accountFindOne.restore();
    });

    context('When Account if no params are passed', () => {
      it('Should return a false', (done) => {
        //Arrange
        const _expectedResult = false;

        //Act
        duplicateCheckerService
          .findAccountDuplicate()
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
      it('Should return a duplicateMatchCase: WEBSITE_DOMAIN', (done) => {
        // Arrange
        accountDTO.domain = 'lifecare.com';

        dedupeWhereClause = [
          {
            domain: accountDTO.domain
          }
        ];

        accountFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          ProjectId: accountDTO.ProjectId,
          id: {
            [Op.ne]: accountDTO.id || ''
          },
          duplicateOf: {
            [Op.eq]: null
          }
        };

        expectedResult.duplicateMatchCase = 'WEBSITE_DOMAIN';

        //stub returns
        accountFindOne.returns(accountFindOneOutput);

        // Act
        duplicateCheckerService
          .findAccountDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountFindOneArgs = accountFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(accountFindOneArgs)).to.deep.equal(
              Object.keys(accountFindOneInput),
              'Expected Query length is not same equal to accountFindOneInput Input Query'
            );

            //expect the query part
            expect(inspect(accountFindOneArgs, { depth: null })).to.deep.equal(
              inspect(accountFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find account data from DB Query Differs'
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
      it('Should return a duplicateMatchCase: SCRUBBED_COMPANY_NAME', (done) => {
        // Arrange
        accountDTO.scrubbedName = 'lifecare assurance';

        dedupeWhereClause = [
          {
            scrubbedName: accountDTO.scrubbedName
          }
        ];

        accountFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          ProjectId: accountDTO.ProjectId,
          id: {
            [Op.ne]: accountDTO.id || ''
          },
          duplicateOf: {
            [Op.eq]: null
          }
        };

        expectedResult.duplicateMatchCase = 'SCRUBBED_COMPANY_NAME';

        //stub returns
        accountFindOne.returns(accountFindOneOutput);

        // Act
        duplicateCheckerService
          .findAccountDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountFindOneArgs = accountFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(accountFindOneArgs)).to.deep.equal(
              Object.keys(accountFindOneInput),
              'Expected Query length is not same equal to accountFindOneInput Input Query'
            );

            //expect the query part
            expect(inspect(accountFindOneArgs, { depth: null })).to.deep.equal(
              inspect(accountFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find account data from DB Query Differs'
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
      it('Should return a duplicateMatchCase: COMPANY_ALIAS_NAME', (done) => {
        // Arrange
        accountDTO.aliasName = 'lifecareAssurance';

        dedupeWhereClause = [
          {
            aliasName: accountDTO.aliasName
          }
        ];

        accountFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          ProjectId: accountDTO.ProjectId,
          id: {
            [Op.ne]: accountDTO.id || ''
          },
          duplicateOf: {
            [Op.eq]: null
          }
        };

        expectedResult.duplicateMatchCase = 'COMPANY_ALIAS_NAME';

        //stub returns
        accountFindOne.returns(accountFindOneOutput);

        // Act
        duplicateCheckerService
          .findAccountDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountFindOneArgs = accountFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(accountFindOneArgs)).to.deep.equal(
              Object.keys(accountFindOneInput),
              'Expected Query length is not same equal to accountFindOneInput Input Query'
            );

            //expect the query part
            expect(inspect(accountFindOneArgs, { depth: null })).to.deep.equal(
              inspect(accountFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find account data from DB Query Differs'
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
      it('Should return a duplicateMatchCase: TOKENS', (done) => {
        // Arrange
        accountDTO.tokens = 'lifecare|assurance';

        dedupeWhereClause = [
          {
            tokens: accountDTO.tokens
          }
        ];

        accountFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          ProjectId: accountDTO.ProjectId,
          id: {
            [Op.ne]: accountDTO.id || ''
          },
          duplicateOf: {
            [Op.eq]: null
          }
        };

        expectedResult.duplicateMatchCase = 'TOKENS';

        //stub returns
        accountFindOne.returns(accountFindOneOutput);

        // Act
        duplicateCheckerService
          .findAccountDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountFindOneArgs = accountFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(accountFindOneArgs)).to.deep.equal(
              Object.keys(accountFindOneInput),
              'Expected Query length is not same equal to accountFindOneInput Input Query'
            );

            //expect the query part
            expect(inspect(accountFindOneArgs, { depth: null })).to.deep.equal(
              inspect(accountFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find account data from DB Query Differs'
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

    context('When Account Is Not Passed', () => {
      it('Should return a duplicateMatchCase: NONE', (done) => {
        // Arrange
        expectedResult.isDuplicate = false;
        expectedResult.duplicateMatchCase = 'NONE';
        expectedResult.duplicateWith = null;

        dedupeWhereClause = [];

        accountFindOneInput.where = {
          [Op.or]: dedupeWhereClause,
          ProjectId: accountDTO.ProjectId,
          id: {
            [Op.ne]: accountDTO.id || ''
          },
          duplicateOf: {
            [Op.eq]: null
          }
        };

        //stub returns
        accountFindOne.returns();

        // Act
        duplicateCheckerService
          .findAccountDuplicate(params)
          .then((result) => {
            const actualResult = result;

            // Assert
            const accountFindOneArgs = accountFindOne.getCall(0).args[0];

            //expect the query keys
            expect(Object.keys(accountFindOneArgs)).to.deep.equal(
              Object.keys(accountFindOneInput),
              'Expected Query length is not same equal to accountFindOneInput Input Query'
            );

            //expect the query part
            expect(inspect(accountFindOneArgs, { depth: null })).to.deep.equal(
              inspect(accountFindOneInput, {
                depth: null
              }),
              'Expected Query not executed to find account data from DB Query Differs'
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
