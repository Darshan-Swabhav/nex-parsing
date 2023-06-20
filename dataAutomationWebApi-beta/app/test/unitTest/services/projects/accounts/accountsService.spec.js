const {
  expect
} = require('chai');
const sinon = require('sinon');
const { CloudTasksClient } = require('@google-cloud/tasks');
const proxyquire = require('proxyquire');
const {
  Task,
  Account,
  File,
  Project,
  Contact,
  User,
  Job,
  Sequelize,
  sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const { inspect } = require('util');
const {
  Op
} = Sequelize;

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const accountFinderInstanceStub = {};

const AccountFinderStub = sinon.stub().returns(accountFinderInstanceStub);

const accountCheckServicesInstanceStub = {};

const AccountCheckServiceStub = sinon.stub().returns(accountCheckServicesInstanceStub);

const sanitizerInstanceStub = {};

const SanitizerStub = sinon.stub().returns(sanitizerInstanceStub);

const filterHandlerInstanceStub = {
  validate: sinon.stub(),
  buildWhereClause: sinon.stub(),
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const downloadServiceRepo = {
  accountExporter: sinon.stub(),
};

const AccountServiceModule = proxyquire(
  './../../../../../services/projects/accounts/accountsService.js', {
    '../../../config/settings/settings-config': settingsConfig,
    '@nexsalesdev/da-download-service-repository': downloadServiceRepo,
    '../../commonServices/sanitizer': SanitizerStub,
    '../../commonServices/accountFinder': AccountFinderStub,
    '../../commonServices/checkAccount': AccountCheckServiceStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
  }
);
const accountServiceModule = new AccountServiceModule();
let accountFindAll, accountCount;

let accountServiceGetAllAccountDisposition, dateStub, accountServiceGetAllAccountStages, accountStatsFindAll, accountsCountMaxRecords, accountServiceAddFile, accountServiceEnqueue, accountServiceUpdateJobStatus, cloudTasksClientStub, accountsServiceGenerateFileNameBasedOnFilter, accountServiceGetProjectName, accountFileCreate, accountServiceProjectFindOne;

describe('#accountsService - getAccountStats', function () {
  beforeEach(function () {
    accountServiceGetAllAccountDisposition = sinon.stub(accountServiceModule, 'getAllAccountDispositions');
    accountServiceGetAllAccountStages = sinon.stub(accountServiceModule, 'getAllAccountStages');
  });
  afterEach(function () {
    accountServiceGetAllAccountDisposition.restore();
    accountServiceGetAllAccountStages.restore();
  });
  describe('Get Account Stats', function () {
    context('Get account stats data', function () {
      it('Should get account stats when correct params are passed', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        accountServiceGetAllAccountDisposition.returns({
          data: [{
            disposition: "string",
            count: 0
          }],
          totalCount: 0
        });

        accountServiceGetAllAccountStages.returns({
          data: [{
            stage: "string",
            count: 0
          }],
          totalCount: 0
        });

        // Act
        accountServiceModule.getAccountStats(inputs, filter)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              dispositions: {
                data: [{
                  disposition: "string",
                  count: 0
                }],
                totalCount: 0
              },
              stages: {
                data: [{
                  stage: "string",
                  count: 0
                }],
                totalCount: 0
              },
            };

            expect(actualData).to.deep.equal(expectedData);

            const expectedGetAllAccountDispositionsArgs = {
              inputs,
              filter,
            }

            const actualGetAllAccountDispositionsFirstArgs = accountServiceGetAllAccountDisposition.getCall(0).args[0];
            const actualGetAllAccountDispositionsSecondArgs = accountServiceGetAllAccountDisposition.getCall(0).args[1];
            const actualGetAllAccountDispositionsArgsLength = accountServiceGetAllAccountDisposition.getCall(0).args.length;

            expect(actualGetAllAccountDispositionsFirstArgs).to.deep.equal(expectedGetAllAccountDispositionsArgs.inputs, 'Expected value not pass in get all account dispositions function');
            expect(actualGetAllAccountDispositionsSecondArgs).to.deep.equal(expectedGetAllAccountDispositionsArgs.filter, 'Expected value not pass in get all account dispositions function');
            expect(actualGetAllAccountDispositionsArgsLength).to.deep.equal(Object.keys(expectedGetAllAccountDispositionsArgs).length, 'Expected value not pass in get all account dispositions function');

            const expectedGetAllAccountStagesArgs = {
              inputs,
              filter,
            }

            const actualGetAllAccountStagesFirstArgs = accountServiceGetAllAccountStages.getCall(0).args[0];
            const actualGetAllAccountStagesSecondArgs = accountServiceGetAllAccountStages.getCall(0).args[1];
            const actualGetAllAccountStagesArgsLength = accountServiceGetAllAccountStages.getCall(0).args.length;

            expect(actualGetAllAccountStagesFirstArgs).to.deep.equal(expectedGetAllAccountStagesArgs.inputs, 'Expected value not pass in get all account stages function');
            expect(actualGetAllAccountStagesSecondArgs).to.deep.equal(expectedGetAllAccountStagesArgs.filter, 'Expected value not pass in get all account stages function');
            expect(actualGetAllAccountStagesArgsLength).to.deep.equal(Object.keys(expectedGetAllAccountStagesArgs).length, 'Expected value not pass in get all account stages function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting dispositions counts', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        accountServiceGetAllAccountDisposition.throws(new Error('Something went wrong'));

        accountServiceGetAllAccountStages.returns({
          data: [{
            stage: "string",
            count: 0
          }],
          totalCount: 0
        });

        // Act
        accountServiceModule.getAccountStats(inputs, filter)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting stages counts', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        accountServiceGetAllAccountDisposition.returns({
          data: [{
            disposition: "string",
            count: 0
          }],
          totalCount: 0
        });

        accountServiceGetAllAccountStages.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.getAccountStats(inputs, filter)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#accountsService - getAllAccountDispositions', function () {
  beforeEach(function () {
    accountStatsFindAll = sinon.stub(Account, 'findAll');
  });
  afterEach(function () {
    accountStatsFindAll.restore();
  });
  describe('Get Account stats dispositions count', function () {
    context('Get account stats dispositions with count data', function () {
      it('Should get account stats dispositions with count when correct params are passed', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        const accountsStatsFindAllRes = [{
          disposition: "string",
          count: 0
        }];

        accountStatsFindAll.returns(accountsStatsFindAllRes);

        // Act
        accountServiceModule.getAllAccountDispositions(inputs, filter)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              data: [{
                disposition: "string",
                count: 0
              }],
              totalCount: 0
            };

            const where = {};
            where.ProjectId = "01";

            const filterColumnsMapping = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where,
            }

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        accountStatsFindAll.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.getAllAccountDispositions(inputs, filter)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate account dispositions stats data query', function () {
      before(function () {
        const accountStatsFindOneWhere = {};
        accountStatsFindOneWhere.ProjectId = "01";
        filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(accountStatsFindOneWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        const where = {};
        where.ProjectId = "01";

        const accountsStatsFindAllRes = [{
          disposition: "string",
          count: 0
        }];

        accountStatsFindAll.returns(accountsStatsFindAllRes);

        // Act
        accountServiceModule.getAllAccountDispositions(inputs, filter)
          .then(function () {
            // Assert
            const expectedAccountStatsFindAllArgs = {
              attributes: [
                'disposition',
                [sequelize.literal(`count(DISTINCT("Account"."id"))`), 'count'],
              ],
              include: [
                {
                  model: Task,
                  where: {
                    status: {
                      [Op.ne]: 'In-Active',
                    },
                    ProjectId: inputs.projectId,
                  },
                  required: false,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
              ],
              group: ['Account.disposition'],
              where: [where],
              raw: true,
              subQuery: false,
            };

            const actualAccountStatsFindAllFirstArg = accountStatsFindAll.getCall(0).args[0];
            expect(inspect(actualAccountStatsFindAllFirstArg.attributes, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.attributes, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.group, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.group, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.include, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.where, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.raw, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.raw, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.subQuery, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(Object.keys(actualAccountStatsFindAllFirstArg).length).to.deep.equal(Object.keys(expectedAccountStatsFindAllArgs).length, 'Expected value not pass in account stats find all function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        filterHandlerInstanceStub.buildWhereClause = sinon.stub();
      });
    });
  });
});

describe('#accountsService - getAllAccountStages', function () {
  beforeEach(function () {
    accountStatsFindAll = sinon.stub(Account, 'findAll');
  });
  afterEach(function () {
    accountStatsFindAll.restore();
  });
  describe('Get account stats getAllAccountStages count', function () {
    context('Get account stats getAllAccountStages with count data', function () {
      it('Should get account stats getAllAccountStages with count when correct params are passed', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        const accountsStatsFindAllRes = [{
          stage: "string",
          count: 0
        }];

        accountStatsFindAll.returns(accountsStatsFindAllRes);

        // Act
        accountServiceModule.getAllAccountStages(inputs, filter)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              data: [{
                stage: "string",
                count: 0
              }],
              totalCount: 0
            };

            const where = {};
            where.ProjectId = "01";

            const filterColumnsMapping = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where,
            }

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        accountStatsFindAll.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.getAllAccountStages(inputs, filter)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate account stages stats data query', function () {
      before(function () {
        const accountStatsFindOneWhere = {};
        accountStatsFindOneWhere.ProjectId = "01";
        filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(accountStatsFindOneWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
        };

        const filter = {};

        const where = {};
        where.ProjectId = "01";

        const accountsStatsFindAllRes = [{
          stage: "string",
          count: 0
        }];

        accountStatsFindAll.returns(accountsStatsFindAllRes);

        // Act
        accountServiceModule.getAllAccountStages(inputs, filter)
          .then(function () {
            // Assert
            const expectedAccountStatsFindAllArgs = {
              attributes: [
                'stage',
                [sequelize.literal(`count(DISTINCT("Account"."id"))`), 'count'],
              ],
              include: [
                {
                  model: Task,
                  where: {
                    status: {
                      [Op.ne]: 'In-Active',
                    },
                    ProjectId: inputs.projectId,
                  },
                  required: false,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
              ],
              group: ['Account.stage'],
              where: [where],
              raw: true,
              subQuery: false,
            };

            const actualAccountStatsFindAllFirstArg = accountStatsFindAll.getCall(0).args[0];
            expect(inspect(actualAccountStatsFindAllFirstArg.attributes, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.attributes, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.group, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.group, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.include, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.where, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.raw, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.raw, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(inspect(actualAccountStatsFindAllFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedAccountStatsFindAllArgs.subQuery, { depth: null }), 'Expected value not pass in account stats find all function');
            expect(Object.keys(actualAccountStatsFindAllFirstArg).length).to.deep.equal(Object.keys(expectedAccountStatsFindAllArgs).length, 'Expected value not pass in account stats find all function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        filterHandlerInstanceStub.buildWhereClause = sinon.stub();
      });
    });
  });
});

describe('#accountsService - getAccountDispositions', () => {
  beforeEach(function () {
    accountFindAll = sinon.stub(Account, 'findAll');
  });
  afterEach(function () {
    accountFindAll.restore()
  });
  describe('Returns list of unique Account dispositions (Facets)', () => {
    context('When Account Dispositions are found', () => {
      it('Should return array of dispositions', (done) => {
        // Arrange
        const accountDTO = {
          projectId: '01',
        };

        const expectedResult = [
          'Generic Email',
          'Contact Built',
          'Contact Found: Email Bad',
        ];

        accountFindAll.returns([{
            disposition: 'Generic Email'
          },
          {
            disposition: 'Contact Built'
          },
          {
            disposition: 'Contact Found: Email Bad'
          },
        ]);

        accountServiceModule.getAccountDispositions(accountDTO)
          .then(function (result) {
            // Assert
            const actualResult = result;
            expect(actualResult).to.deep.equal(expectedResult);
            expect(actualResult.length).to.equal(expectedResult.length);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Validate if the query arguments are valid', function () {
      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const accountDTO = {
          projectId: '01',
        };

        const expectedAccountFindAllInput = {
          attributes: [
            [Sequelize.fn('DISTINCT', Sequelize.col('disposition')), 'disposition'],
          ],
          where: {
            ProjectId: accountDTO.projectId
          },
        };

        accountFindAll.returns([{
            disposition: 'Generic Email'
          },
          {
            disposition: 'Contact Built'
          },
          {
            disposition: 'Contact Found: Email Bad'
          },
        ]);

        accountServiceModule.getAccountDispositions(accountDTO)
          .then(function () {
            // Assert
            const actualAccountFindAllInputFirstArgs = accountFindAll.getCall(0).args[0];
            const actualAccountFindAllInputArgsLength = accountFindAll.getCall(0).args.length;
            const expectedAccountFindAllInputArgsLength = 1;

            expect(inspect(actualAccountFindAllInputFirstArgs, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllInput, { depth: null }));
            expect(actualAccountFindAllInputArgsLength).to.equal(expectedAccountFindAllInputArgsLength);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const accountDTO = {
          projectId: '01',
        };

        accountFindAll.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule
          .getAccountDispositions(accountDTO)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#accountsService - getFileIsLarger', () => {
  beforeEach(function () {
    accountsCountMaxRecords = sinon.stub(Account, 'count');
  });
  afterEach(function () {
    accountsCountMaxRecords.restore();
  });
  describe('Check the size of records for download process selection', () => {
    context('Check the size of the requested payload with the maximum records downloadable with synchronous process', () => {
      it('Should return "true" when requested payload size is greater than maximum records', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 1;
        const filter = {};

        accountsCountMaxRecords.returns([{
          accountId: '01',
          count: 1
        }, {
          accountId: '02',
          count: 1
        }]);

        // Act
        accountServiceModule.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function (result) {
            // Assert
            const actualValue = result;
            const expectedValue = true;
            const where = {};
            where.ProjectId = projectId;

            const filterColumnsMapping = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where,
            }

            expect(actualValue).to.equal(expectedValue);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');
            
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return "false" when requested payload size is less than maximum records', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 3;
        const filter = {};
        
        accountsCountMaxRecords.returns([{
          accountId: '01',
          count: 1
        }, {
          accountId: '02',
          count: 1
        }]);

        // Act
        accountServiceModule.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function (result) {
            // Assert
            const actualValue = result;
            const expectedValue = false;
            const where = {};
            where.ProjectId = projectId;

            const filterColumnsMapping = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where,
            }

            expect(actualValue).to.equal(expectedValue);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');
            
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {};

        accountsCountMaxRecords.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate contact count data query', () => {
      before(function () {
        const accountsCountMaxRecordsWhere = {};
        accountsCountMaxRecordsWhere.ProjectId = "01";
        filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(accountsCountMaxRecordsWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {};

        accountsCountMaxRecords.returns(200);

        const where = {};
        where.ProjectId = "01";

        // Act
        accountServiceModule.getFileIsLarger(projectId, filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedContactsCountMaxRecordsArgs = {
              where: [where],
              include: [
                {
                  model: Task,
                  where: {
                    status: {
                      [Op.ne]: 'In-Active',
                    },
                    ProjectId: projectId,
                  },
                  required: false,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
              ],
              group: ['Account.id'],
              raw: true,
              subQuery: false,
            };

            const actualAccountsCountMaxRecordsArgs = accountsCountMaxRecords.getCall(0).args[0];
            expect(inspect(actualAccountsCountMaxRecordsArgs.include, { depth: null })).to.deep.equal(inspect(expectedContactsCountMaxRecordsArgs.include, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualAccountsCountMaxRecordsArgs.group, { depth: null })).to.deep.equal(inspect(expectedContactsCountMaxRecordsArgs.group, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualAccountsCountMaxRecordsArgs.where, { depth: null })).to.deep.equal(inspect(expectedContactsCountMaxRecordsArgs.where, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualAccountsCountMaxRecordsArgs.raw, { depth: null })).to.equal(inspect(expectedContactsCountMaxRecordsArgs.raw, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualAccountsCountMaxRecordsArgs.subQuery, { depth: null })).to.equal(inspect(expectedContactsCountMaxRecordsArgs.subQuery, { depth: null }), 'Expected value not pass in account count for maximum records function');
            expect(Object.keys(actualAccountsCountMaxRecordsArgs).length).to.deep.equal(Object.keys(expectedContactsCountMaxRecordsArgs).length, 'Expected value not pass in account count for maximum records function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        filterHandlerInstanceStub.buildWhereClause = sinon.stub();
      });
    });
  });
});

describe('#accountsService - downloadAllAccount', function () {
  beforeEach(function () {
    accountServiceAddFile = sinon.stub(accountServiceModule, 'addFile');
    accountServiceEnqueue = sinon.stub(accountServiceModule, 'enqueue');
  });
  afterEach(function () {
    accountServiceAddFile.restore();
    accountServiceEnqueue.restore();
  });
  describe('Downloads accounts or submits jobs for downloading accounts', function () {
    context('Process accounts download request', function () {
      it('Should correctly process and download accounts when async download is disabled', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountExporter.returns('Exported Records Successfully')

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Exported Records Successfully';

            const fileData = {
              fileId: inputs.fileId,
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter,
              createdBy: inputs.userId,
              updatedBy: inputs.userId,
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload,
            }

            const dbParam = {
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter,
            };

            const expectedAccountExporterArgs = {
              writableStream,
              dbParam,
            };

            const actualAddFileFirstArgs = accountServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = accountServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = accountServiceAddFile.getCall(0).args.length;

            const actualAccountExporterFirstArgs = downloadServiceRepo.accountExporter.getCall(0).args[0];
            const actualAccountExporterSecondArgs = downloadServiceRepo.accountExporter.getCall(0).args[1];
            const actualAccountExporterArgsLength = downloadServiceRepo.accountExporter.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);
            
            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualAccountExporterFirstArgs).to.deep.equal(expectedAccountExporterArgs.writableStream, 'Expected value not pass in account exporter function');
            expect(actualAccountExporterSecondArgs).to.deep.equal(expectedAccountExporterArgs.dbParam, 'Expected value not pass in account exporter function');
            expect(actualAccountExporterArgsLength).to.deep.equal(Object.keys(expectedAccountExporterArgs).length, 'Expected value not pass in account exporter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should correctly process and enqueue job when async download is enabled', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountExporter.returns('Exported Records Successfully')

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Download Task Enqueued Successfully';

            const fileData = {
              fileId: inputs.fileId,
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter,
              createdBy: inputs.userId,
              updatedBy: inputs.userId,
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload,
            }

            const expectedEnqueueArgs = {
              jobId: fileData.jobId,
              projectId: fileData.projectId,
              filter,
            };

            const actualAddFileFirstArgs = accountServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = accountServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = accountServiceAddFile.getCall(0).args.length;

            const actualEnqueueFirstArgs = accountServiceEnqueue.getCall(0).args[0];
            const actualEnqueueSecondArgs = accountServiceEnqueue.getCall(0).args[1];
            const actualEnqueueThirdArgs = accountServiceEnqueue.getCall(0).args[2];
            const actualEnqueueArgsLength = accountServiceEnqueue.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);
            
            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualEnqueueFirstArgs).to.deep.equal(expectedEnqueueArgs.jobId, 'Expected value not pass in enqueue function');
            expect(actualEnqueueSecondArgs).to.deep.equal(expectedEnqueueArgs.projectId, 'Expected value not pass in enqueue function');
            expect(actualEnqueueThirdArgs).to.deep.equal(expectedEnqueueArgs.filter, 'Expected value not pass in enqueue function');
            expect(actualEnqueueArgsLength).to.deep.equal(Object.keys(expectedEnqueueArgs).length, 'Expected value not pass in enqueue function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while adding file', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        accountServiceAddFile.throws(new Error('Something went wrong'));

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountExporter.returns('Exported Records Successfully');

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while enqueueing task for async download', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.throws(new Error('Something went wrong'));

        downloadServiceRepo.accountExporter.returns('Exported Records Successfully');

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while accounts exports for sync download', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountExporter.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#accountsService - updateJobStatus', function () {
  beforeEach(function () {
    accountServiceUpdateJobStatus = sinon.stub(Job, 'update');
  });
  afterEach(function () {
    accountServiceUpdateJobStatus.restore();
  });
  describe('Update job status', function(){
    context('Update status based on job result', function(){
      it('Should update job status correctly', function (done) {
        const jobId = '01';
        const status = 'Processed';

        accountServiceUpdateJobStatus.returns('Job Updated Successfully');

        accountServiceModule.updateJobStatus(jobId, status)
        .then(function (result) {
          // Assert
          const expectedMsg = 'Job Updated Successfully';
          const actualMsg = result;

          const expectedUpdatedJobStatusArgs = {
            jobObj: {
              status,
            },
            whereObj: {
              where: {
                id: jobId,
              },
            },
          };

          expect(actualMsg).to.equal(expectedMsg);

          const actualUpdatedJobStatusFirstArgs = accountServiceUpdateJobStatus.getCall(0).args[0];
          const actualUpdatedJobStatusSecondArgs = accountServiceUpdateJobStatus.getCall(0).args[1];
          const actualUpdatedJobStatusArgsLength = accountServiceUpdateJobStatus.getCall(0).args.length;

          expect(inspect(actualUpdatedJobStatusFirstArgs, { depth: null })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.jobObj, { depth: null }), 'Expected value not pass in job update function');
          expect(inspect(actualUpdatedJobStatusSecondArgs, { depth: null })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.whereObj, { depth: null }), 'Expected value not pass in job update function');
          expect(actualUpdatedJobStatusArgsLength).to.equal(Object.keys(expectedUpdatedJobStatusArgs).length, 'Expected value not pass in job update function');

          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should throw error when something internally fails while updating job', function (done) {
        //Arrange
        const jobId = '01';
        const status = 'Processed';

        accountServiceUpdateJobStatus.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.updateJobStatus(jobId, status)
          .then(function (result) {
            const actual = result;
            const expected = undefined;

            expect(actual).to.equal(expected);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#accountsService - enqueue', function () {
  describe('Enqueue task in the queue', function () {
    context('Adds the task to the queue for process', function () {
      before(function () {
        cloudTasksClientStub = sinon.stub(CloudTasksClient.prototype, "createTask").returns([{
          name: 'task1'
        }]);
      });
      it('Should enqueue task when correct params are passed', function (done) {
        const jobId = '01'; 
        const projectId = '01';
        const filter = {};

        accountServiceModule.enqueue(jobId, projectId, filter)
        .then(function (result){
          const actual = result;
          const expected = undefined;

          const payload = {
            jobId,
            projectId,
            filter,
          };

          const task = {
            httpRequest: {
              httpMethod: 'POST',
              url: 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app',
            },
          };
          task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString(
            'base64',
          );
          task.httpRequest.headers = {
            'Content-Type': 'application/json',
          };
          task.httpRequest.oidcToken = {
            serviceAccountEmail: 'trigger-na0xhcju@da-tf-project-1-1b0f.iam.gserviceaccount.com',
          };

          const expectedRequest = {
            parent: 'projects/da-tf-project-1-1b0f/locations/us-central1/queues/da-dev-task-queue',
            task,
          };

          const actualCloudTaskLinkCreateTaskArgs = cloudTasksClientStub.getCall(0).args[0];
          const actualCloudTaskLinkCreateTaskArgsLength = Object.keys(cloudTasksClientStub.getCall(0).args[0]).length;

          expect(actual).to.equal(expected);
          expect(actualCloudTaskLinkCreateTaskArgs.parent).to.equal(expectedRequest.parent, 'Expected value not pass in cloud task link create task function');
          expect(actualCloudTaskLinkCreateTaskArgs.task).to.deep.equal(expectedRequest.task, 'Expected value not pass in cloud task link create task function');
          expect(actualCloudTaskLinkCreateTaskArgsLength).to.equal(Object.keys(expectedRequest).length, 'Expected value not pass in cloud task link create task function');
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
      after(function () {
        cloudTasksClientStub.restore();
      });
    });

    context('Adds the task to the queue for process', function () {
      before(function () {
        cloudTasksClientStub = sinon.stub(CloudTasksClient.prototype, "createTask").throws(new Error('Something went wrong'));
      });
      it('Should throw error when something internally fails while enqueueing task', function (done) {
        const jobId = '01'; 
        const projectId = '01';
        const filter = {};

        accountServiceModule.enqueue(jobId, projectId, filter)
        .then(function (result){
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
      after(function () {
        cloudTasksClientStub.restore();
      });
    });
  });
});

describe('#accountsService - addFile', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    accountsServiceGenerateFileNameBasedOnFilter = sinon.stub(accountServiceModule, 'generateFileNameBasedOnFilter').returns(`test_account_${new Date(Date.now())}.csv`);
    accountServiceGetProjectName = sinon.stub(accountServiceModule, 'getProjectName');
    accountFileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    dateStub.restore();
    accountsServiceGenerateFileNameBasedOnFilter.restore();
    accountServiceGetProjectName.restore();
    accountFileCreate.restore();
  });
  describe('Adds File to DB', function () {
    context('File creation in DB', function () {
      it('Should successfully create a file when all correct params are passed during sync download', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = false;

        accountServiceGetProjectName.returns('test');

        accountFileCreate.returns('File Created Successfully');

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectedGetProjectNameArgs = {
              projectId: fileData.projectId,
            };

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `test_account_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: '',
                mapping: {},
                ProjectId: fileData.projectId,
                createdBy: fileData.createdBy,
                updatedBy: fileData.updatedBy || fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Processing',
                  operation_name: 'syncAccountExport',
                  operation_param: {},
                  result_processed: 0,
                  result_imported: 0,
                  result_errored: 0,
                  createdBy: fileData.createdBy,
                  updatedBy: fileData.updatedBy || fileData.createdBy,
                  row_count: 0,
                },
              },
              includeObject: {
                include: [
                  {
                    model: Job,
                  },
                ],
              },
            }

            const espectedGenerateFileNameBasedOnFilter = {
              projectName: 'test',
              filter: {},
            }

            const actualGetProjectNameFirstArgs = accountServiceGetProjectName.getCall(0).args[0];
            const actualGetProjectNameArgsLength = accountServiceGetProjectName.getCall(0).args.length;

            expect(actualMsg).to.equal(expectedMsg);

            expect(actualGetProjectNameFirstArgs).to.deep.equal(expectedGetProjectNameArgs.projectId, 'Expected value not pass in get project name function');
            expect(actualGetProjectNameArgsLength).to.deep.equal(Object.keys(expectedGetProjectNameArgs).length, 'Expected value not pass in get project name function');

            const actualFileCreateFirstArgs = accountFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = accountFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = accountFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, { depth: null }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, { depth: null }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            const actualGenerateFileNameBasedOnFilterFirstArgs = accountsServiceGenerateFileNameBasedOnFilter.getCall(0).args[0];
            const actualGenerateFileNameBasedOnFilterSecondArgs = accountsServiceGenerateFileNameBasedOnFilter.getCall(0).args[1];
            const actualGenerateFileNameBasedOnFilterArgsLength = accountsServiceGenerateFileNameBasedOnFilter.getCall(0).args.length;

            expect(actualGenerateFileNameBasedOnFilterFirstArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.projectName, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterSecondArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.filter, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterArgsLength).to.equal(Object.keys(espectedGenerateFileNameBasedOnFilter).length, 'Expected value not pass in generate file name based on filter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should successfully create a file when all correct params are passed during async download', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        accountServiceGetProjectName.returns('test');

        accountFileCreate.returns('File Created Successfully');

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectedGetProjectNameArgs = {
              projectId: fileData.projectId,
            };

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `test_account_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: `files/${fileData.projectId}/Export/test_account_${new Date(Date.now())}.csv`,
                mapping: {},
                ProjectId: fileData.projectId,
                createdBy: fileData.createdBy,
                updatedBy: fileData.updatedBy || fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Queued',
                  operation_name: 'asyncAccountExport',
                  operation_param: {},
                  result_processed: 0,
                  result_imported: 0,
                  result_errored: 0,
                  createdBy: fileData.createdBy,
                  updatedBy: fileData.updatedBy || fileData.createdBy,
                  row_count: 0,
                },
              },
              includeObject: {
                include: [
                  {
                    model: Job,
                  },
                ],
              },
            }

            const espectedGenerateFileNameBasedOnFilter = {
              projectName: 'test',
              filter: {},
            }

            const actualGetProjectNameFirstArgs = accountServiceGetProjectName.getCall(0).args[0];
            const actualGetProjectNameArgsLength = accountServiceGetProjectName.getCall(0).args.length;

            expect(actualMsg).to.equal(expectedMsg);

            expect(actualGetProjectNameFirstArgs).to.deep.equal(expectedGetProjectNameArgs.projectId, 'Expected value not pass in get project name function');
            expect(actualGetProjectNameArgsLength).to.deep.equal(Object.keys(expectedGetProjectNameArgs).length, 'Expected value not pass in get project name function');

            const actualFileCreateFirstArgs = accountFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = accountFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = accountFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, { depth: null }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, { depth: null })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, { depth: null }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            const actualGenerateFileNameBasedOnFilterFirstArgs = accountsServiceGenerateFileNameBasedOnFilter.getCall(0).args[0];
            const actualGenerateFileNameBasedOnFilterSecondArgs = accountsServiceGenerateFileNameBasedOnFilter.getCall(0).args[1];
            const actualGenerateFileNameBasedOnFilterArgsLength = accountsServiceGenerateFileNameBasedOnFilter.getCall(0).args.length;

            expect(actualGenerateFileNameBasedOnFilterFirstArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.projectName, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterSecondArgs).to.deep.equal(espectedGenerateFileNameBasedOnFilter.filter, 'Expected value not pass in generate file name based on filter function');
            expect(actualGenerateFileNameBasedOnFilterArgsLength).to.equal(Object.keys(espectedGenerateFileNameBasedOnFilter).length, 'Expected value not pass in generate file name based on filter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while generating file name', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        accountsServiceGenerateFileNameBasedOnFilter.throws(new Error('Something went wrong'));

        accountServiceGetProjectName.returns('test');

        accountFileCreate.returns('File Created Successfully');

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting project name', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        accountServiceGetProjectName.throws(new Error('Something went wrong'));

        accountFileCreate.returns('File Created Successfully');

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while creating file in DB', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01',
          filter: {},
        };

        const isAsyncDownload = true;

        accountServiceGetProjectName.returns('test');

        accountFileCreate.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#accountsService - getProjectName', function () {
  beforeEach(function () {
    accountServiceProjectFindOne = sinon.stub(Project, 'findOne');
  });
  afterEach(function () {
    accountServiceProjectFindOne.restore();
  });
  describe('Get project name', function(){
    context('Fetch name of a project', function(){
      it('Should return name of project when correct params are passed', function (done) {
        const projectId = '01';

        accountServiceProjectFindOne.returns({
          aliasName: 'project1',
        });

        accountServiceModule.getProjectName(projectId)
        .then(function (result) {
          // Assert
          const expectedValue = 'project1';
          const actualValue = result;

          const expectedGetProjectNameArgs = {
            attributes: ['aliasName'],
            where: [
              {
                id: projectId,
              },
            ],
          }

          expect(actualValue).to.equal(expectedValue);

          const actualGetProjectNameFirstArgs = accountServiceProjectFindOne.getCall(0).args[0];

          expect(inspect(actualGetProjectNameFirstArgs.attributes, { depth: null })).to.deep.equal(inspect(expectedGetProjectNameArgs.attributes, { depth: null }), 'Expected value not pass in get project name function');
          expect(inspect(actualGetProjectNameFirstArgs.where, { depth: null })).to.deep.equal(inspect(expectedGetProjectNameArgs.where, { depth: null }), 'Expected value not pass in get project name function');
          expect(Object.keys(actualGetProjectNameFirstArgs).length).to.equal(Object.keys(expectedGetProjectNameArgs).length, 'Expected value not pass in get project name function');
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });

      it('Should throw error when something internally fails while getting project name', function (done) {
        //Arrange
        const projectId = '01';

        accountServiceProjectFindOne.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.getProjectName(projectId)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Something went wrong`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
  });
});

describe('#accountsService - getAllAccount', function() {
  beforeEach(function () {
    const accountFindAndCountAllWhere = {};
    accountFindAndCountAllWhere.ProjectId = "01";
    filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(accountFindAndCountAllWhere);
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
    accountFindAll = sinon.stub(Account, 'findAll');
    accountCount = sinon.stub(Account, 'count');
  });
  afterEach(function () {
    filterHandlerInstanceStub.buildWhereClause = sinon.stub();
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    accountFindAll.restore();
    accountCount.restore();
  });
  describe('Get accounts list with total count of accounts', function() {
    context('Get accounts and its total counts', function() {
      it('Should return accounts and total count', function(done) {
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountFindAll.returns([]);
        accountCount.returns([]);

        accountServiceModule.getAllAccount(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              totalCount: 0,
              docs: [],
            };
            const where = {};
            where.ProjectId = "01";

            const filterColumnsMapping = {};

            const sortColumnsMapping = {};

            const customSortColumn = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where,
            }

            const order = [];

            const expectedBuildOrderClauseArgs = {
              sortColumnsMapping,
              customSortColumn,
              sort,
              order,
            }

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            const actualBuildOrderClauseFirstArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
            const actualBuildOrderClauseSecondArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
            const actualBuildOrderClauseThirdArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
            const actualBuildOrderClauseFourthArgs = sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
            const actualBuildOrderClauseArgsLength = sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

            expect(inspect(actualBuildWhereClauseFirstArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, { depth: null }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, { depth: null })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, { depth: null }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedBuildOrderClauseArgs.sortColumnsMapping, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseSecondArgs).to.deep.equal(expectedBuildOrderClauseArgs.customSortColumn, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseThirdArgs).to.deep.equal(expectedBuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseFourthArgs).to.deep.equal(expectedBuildOrderClauseArgs.order, 'Expected value not pass in build order clause function');
            expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedBuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');
            
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should throw error when something internally fails while finding account', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountFindAll.throws(new Error('Something went wrong'));
        accountCount.returns([]);

        // Act
        accountServiceModule.getAllAccount(inputs, filter, sort)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should throw error when something internally fails while getting accounts count', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountCount.throws(new Error('Something went wrong'));
        accountFindAll.returns([]);
        
        // Act
        accountServiceModule.getAllAccount(inputs, filter, sort)
          .then(function (result) {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong`;

            expect(actualErrMsg).to.equal(expectedErrMsg);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Validate account find and count all data query', function() {
      it('Should verify if query payload is valid', function(done) {
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountFindAll.returns([]);
        accountCount.returns([]);

        const where = {};
        where.ProjectId = inputs.projectId;

        const order = [['name', 'asc']];

        accountServiceModule.getAllAccount(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const expectedAccountFindAllArgs = {
              attributes: [
                'name',
                'domain',
                'industry',
                'masterDisposition',
                'masterComments',
                'disposition',
                'researchStatus',
                'stage',
                'complianceStatus',
                'label',
                'duplicateOf',
                'createdAt',
                'updatedAt',
                'potential',
                [
                  sequelize.literal(
                    `CASE WHEN "Tasks"."UserId" IS NULL THEN FALSE ELSE TRUE END`,
                  ),
                  'isAssigned',
                ],
              ],
              where: [where],
              order,
              include: [
                {
                  model: Task,
                  where: {
                    status: {
                      [Op.ne]: 'In-Active',
                    },
                    ProjectId: '01',
                  },
                  required: false,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
              ],
              offset: inputs.offset,
              group: ['Account.id', 'isAssigned'],
              limit: inputs.limit,
              raw: true,
              subQuery: false,
            };

            const expectedAccountCountArgs = {
              where: [where],
              order,
              include: [
                {
                  model: Task,
                  where: {
                    status: {
                      [Op.ne]: 'In-Active',
                    },
                    ProjectId: '01',
                  },
                  required: false,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
              ],
              group: ['Account.id'],
              raw: true,
              subQuery: false,
            };

            const actualAccountFindAllFirstArg = accountFindAll.getCall(0).args[0];
            expect(inspect(actualAccountFindAllFirstArg.attributes, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.attributes, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.order, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.order, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.include, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.where, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.limit, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.limit, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.offset, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.offset, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.raw, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.raw, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.subQuery, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(inspect(actualAccountFindAllFirstArg.group, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.group, { depth: null }), 'Expected value not pass in accounts find all function');
            expect(Object.keys(actualAccountFindAllFirstArg).length).to.deep.equal(Object.keys(expectedAccountFindAllArgs).length, 'Expected value not pass in accounts find all function');

            const actualAccountCountFirstArg = accountCount.getCall(0).args[0];
            expect(inspect(actualAccountCountFirstArg.order, { depth: null })).to.deep.equal(inspect(expectedAccountCountArgs.order, { depth: null }), 'Expected value not pass in accounts count function');
            expect(inspect(actualAccountCountFirstArg.include, { depth: null })).to.deep.equal(inspect(expectedAccountCountArgs.include, { depth: null }), 'Expected value not pass in accounts count function');
            expect(inspect(actualAccountCountFirstArg.where, { depth: null })).to.deep.equal(inspect(expectedAccountCountArgs.where, { depth: null }), 'Expected value not pass in accounts count function');
            expect(inspect(actualAccountCountFirstArg.raw, { depth: null })).to.deep.equal(inspect(expectedAccountCountArgs.raw, { depth: null }), 'Expected value not pass in accounts count function');
            expect(inspect(actualAccountCountFirstArg.subQuery, { depth: null })).to.deep.equal(inspect(expectedAccountCountArgs.subQuery, { depth: null }), 'Expected value not pass in accounts count function');
            expect(inspect(actualAccountFindAllFirstArg.group, { depth: null })).to.deep.equal(inspect(expectedAccountFindAllArgs.group, { depth: null }), 'Expected value not pass in accounts count function');
            expect(Object.keys(actualAccountCountFirstArg).length).to.deep.equal(Object.keys(expectedAccountCountArgs).length, 'Expected value not pass in accounts count function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#accountsService - generateFileNameBasedOnFilter', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
  });
  afterEach(function(){
    dateStub.restore();
  });
  describe('Generate File name', function () {
    context('Returns file name based on filters passed', function () {
      it('Should return compliance file name when stage filter is other than "Ready" and "In Progress"', function(done) {
        const projectName = 'test';
        const filter = {};

        const actualFileName = accountServiceModule.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_account_compliance_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });

      it('Should return deliverable file name when stage filter is "Ready"', function(done) {
        const projectName = 'test';
        const filter = {
          stage: "Ready"
        };

        const actualFileName = accountServiceModule.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_account_deliverable_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });

      it('Should return in progress file name when stage filter is "In Progress"', function(done) {
        const projectName = 'test';
        const filter = {
          stage: "In Progress"
        };

        const actualFileName = accountServiceModule.generateFileNameBasedOnFilter(projectName, filter);
        const expectedFileName = `${projectName}_account_in_progress_${new Date(Date.now())}.csv`;
        expect(actualFileName).to.equal(expectedFileName);
        done();
      });
    });
  });
});