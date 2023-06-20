const { expect } = require('chai');
const sinon = require('sinon');
const { CloudTasksClient } = require('@google-cloud/tasks');
const { inspect } = require('util');
const proxyquire = require('proxyquire');
const {
  Task,
  Project,
  Account,
  Contact,
  User,
  Job,
  File,
  Sequelize,
  sequelize
} = require('@nexsalesdev/dataautomation-datamodel');

const { Op } = Sequelize;

const taskLinkCRUDServiceInstanceStub = {};

const TaskLinkCRUDServiceStub = sinon
  .stub()
  .returns(taskLinkCRUDServiceInstanceStub);

const sanitizerInstanceStub = {
  sanitize: sinon.stub()
};

const SanitizerStub = sinon.stub().returns(sanitizerInstanceStub);

const accountFinderInstanceStub = {};

const AccountFinderStub = sinon.stub().returns(accountFinderInstanceStub);

const contactCheckServiceInstanceStub = {
  check: sinon.stub()
};

const ContactCheckServiceStub = sinon
  .stub()
  .returns(contactCheckServiceInstanceStub);

const contactSaveServiceInstanceStub = {};

const ContactSaveServiceStub = sinon
  .stub()
  .returns(contactSaveServiceInstanceStub);

const filterHandlerInstanceStub = {
  validate: sinon.stub(),
  buildWhereClause: sinon.stub()
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
  buildOrderClause: sinon.stub()
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {}
  }
};

const downloadServiceRepo = {
  contactExporter: sinon.stub()
};

const ContactService = proxyquire(
  '../../../../../services/projects/contacts/contactsService',
  {
    '../../../config/settings/settings-config': settingsConfig,
    '@nexsalesdev/da-download-service-repository': downloadServiceRepo,
    '../tasks/taskLinkService': TaskLinkCRUDServiceStub,
    '../../commonServices/sanitizer': SanitizerStub,
    '../../commonServices/accountFinder': AccountFinderStub,
    '../../commonServices/checkContact': ContactCheckServiceStub,
    '../../commonServices/saveContact': ContactSaveServiceStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler':
      FilterHandlerStub,
    '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler':
      SortHandlerStub
  }
);
const contactService = new ContactService();

let contactServiceGetAllContactResearchStatus,
  contactServiceGetAllContactStages,
  contactStatsFindAll,
  contactFindAll,
  contactsCountMaxRecords,
  contactServiceAddFile,
  contactServiceEnqueue,
  contactServiceGetProjectName,
  contactFileCreate,
  dateStub,
  contactFindAndCountAll,
  contactServiceUpdateJobStatus,
  contactServiceProjectFindOne,
  cloudTasksClientStub;

describe('#contactsService - getAllContactStats', function () {
  beforeEach(function () {
    contactServiceGetAllContactResearchStatus = sinon.stub(
      contactService,
      'getAllContactResearchStatus'
    );
    contactServiceGetAllContactStages = sinon.stub(
      contactService,
      'getAllContactStages'
    );
  });
  afterEach(function () {
    contactServiceGetAllContactResearchStatus.restore();
    contactServiceGetAllContactStages.restore();
  });
  describe('Get Contact Stats', function () {
    context('Get contact stats data', function () {
      it('Should get contacts stats when correct params are passed', function (done) {
        //Arrange
        const inputs = {
          projectId: '01'
        };

        const filter = {};

        contactServiceGetAllContactResearchStatus.returns({
          data: [
            {
              researchStatus: 'string',
              count: 0
            }
          ],
          totalCount: 0
        });

        contactServiceGetAllContactStages.returns({
          data: [
            {
              stage: 'string',
              count: 0
            }
          ],
          totalCount: 0
        });

        // Act
        contactService
          .getAllContactStats(inputs, filter)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              researchStatus: {
                data: [
                  {
                    researchStatus: 'string',
                    count: 0
                  }
                ],
                totalCount: 0
              },
              stage: {
                data: [
                  {
                    stage: 'string',
                    count: 0
                  }
                ],
                totalCount: 0
              }
            };

            expect(actualData).to.deep.equal(expectedData);

            const expectedGetAllContactResearchStatusArgs = {
              inputs,
              filter
            };

            const actualGetAllContactResearchStatusFirstArgs =
              contactServiceGetAllContactResearchStatus.getCall(0).args[0];
            const actualGetAllContactResearchStatusSecondArgs =
              contactServiceGetAllContactResearchStatus.getCall(0).args[1];
            const actualGetAllContactResearchStatusArgsLength =
              contactServiceGetAllContactResearchStatus.getCall(0).args.length;

            expect(actualGetAllContactResearchStatusFirstArgs).to.deep.equal(
              expectedGetAllContactResearchStatusArgs.inputs,
              'Expected value not pass in get all contact researchStatus function'
            );
            expect(actualGetAllContactResearchStatusSecondArgs).to.deep.equal(
              expectedGetAllContactResearchStatusArgs.filter,
              'Expected value not pass in get all contact researchStatus function'
            );
            expect(actualGetAllContactResearchStatusArgsLength).to.deep.equal(
              Object.keys(expectedGetAllContactResearchStatusArgs).length,
              'Expected value not pass in get all contact researchStatus function'
            );

            const expectedGetAllContactStagesArgs = {
              inputs,
              filter
            };

            const actualGetAllContactStagesFirstArgs =
              contactServiceGetAllContactStages.getCall(0).args[0];
            const actualGetAllContactStagesSecondArgs =
              contactServiceGetAllContactStages.getCall(0).args[1];
            const actualGetAllContactStagesArgsLength =
              contactServiceGetAllContactStages.getCall(0).args.length;

            expect(actualGetAllContactStagesFirstArgs).to.deep.equal(
              expectedGetAllContactStagesArgs.inputs,
              'Expected value not pass in get all contact stages function'
            );
            expect(actualGetAllContactStagesSecondArgs).to.deep.equal(
              expectedGetAllContactStagesArgs.filter,
              'Expected value not pass in get all contact stages function'
            );
            expect(actualGetAllContactStagesArgsLength).to.deep.equal(
              Object.keys(expectedGetAllContactStagesArgs).length,
              'Expected value not pass in get all contact stages function'
            );

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting researchStatus counts', function (done) {
        //Arrange
        const inputs = {
          projectId: '01'
        };

        const filter = {};

        contactServiceGetAllContactResearchStatus.throws(
          new Error('Something went wrong')
        );

        contactServiceGetAllContactStages.returns({
          data: [
            {
              stage: 'string',
              count: 0
            }
          ],
          totalCount: 0
        });

        // Act
        contactService
          .getAllContactStats(inputs, filter)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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
          projectId: '01'
        };

        const filter = {};

        contactServiceGetAllContactResearchStatus.returns({
          data: [
            {
              researchStatus: 'string',
              count: 0
            }
          ],
          totalCount: 0
        });

        contactServiceGetAllContactStages.throws(
          new Error('Something went wrong')
        );

        // Act
        contactService
          .getAllContactStats(inputs, filter)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

describe('#contactsService - getAllContactResearchStatus', function () {
  beforeEach(function () {
    contactStatsFindAll = sinon.stub(Contact, 'findAll');
  });
  afterEach(function () {
    contactStatsFindAll.restore();
  });
  describe('Get Contact stats researchStatus count', function () {
    context('Get contact stats researchStatus with count data', function () {
      it('Should get contact stats researchStatus with count when correct params are passed', function (done) {
        //Arrange
        const inputs = {
          projectId: '01'
        };

        const filter = {};

        const contactsStatsFindAllRes = [
          {
            researchStatus: 'string',
            count: 0
          }
        ];

        contactStatsFindAll.returns(contactsStatsFindAllRes);

        // Act
        contactService
          .getAllContactResearchStatus(inputs, filter)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              data: [
                {
                  researchStatus: 'string',
                  count: 0
                }
              ],
              totalCount: 0
            };

            const where = {};
            where[`$Account.ProjectId$`] = '01';

            const filterColumnsMapping = {
              companyName: `$Account.name$`,
              domain: `$Account.domain$`,
              accountLabel: `$Account.label$`,
              contactLabel: `$Contact.label$`,
              updatedBy: `$contactUpdater.userName$`
            };

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where
            };

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            expect(
              inspect(actualBuildWhereClauseFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
                depth: null
              }),
              'Expected value not pass in build where clause function'
            );
            expect(
              inspect(actualBuildWhereClauseSecondArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.filter, { depth: null }),
              'Expected value not pass in build where clause function'
            );
            expect(
              inspect(actualBuildWhereClauseThirdArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.where, { depth: null }),
              'Expected value not pass in build where clause function'
            );
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(
              Object.keys(expectedBuildWhereClauseArgs).length,
              'Expected value not pass in build where clause function'
            );

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const inputs = {
          projectId: '01'
        };

        const filter = {};

        contactStatsFindAll.throws(new Error('Something went wrong'));

        // Act
        contactService
          .getAllContactResearchStatus(inputs, filter)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

    context('Validate contact researchStatus stats data query', function () {
      before(function () {
        const contactStatsFindOneWhere = {};
        contactStatsFindOneWhere[`$Account.ProjectId$`] = '01';
        filterHandlerInstanceStub.buildWhereClause = sinon
          .stub()
          .returns(contactStatsFindOneWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const inputs = {
          projectId: '01'
        };

        const filter = {};

        const where = {};
        where[`$Account.ProjectId$`] = '01';

        const contactsStatsFindAllRes = [
          {
            researchStatus: 'string',
            count: 0
          }
        ];

        contactStatsFindAll.returns(contactsStatsFindAllRes);

        // Act
        contactService
          .getAllContactResearchStatus(inputs, filter)
          .then(function () {
            // Assert
            const expectedContactStatsFindAllArgs = {
              attributes: [
                'researchStatus',
                [sequelize.fn('count', '*'), 'count']
              ],
              group: ['Contact.researchStatus'],
              include: [
                {
                  model: Account,
                  attributes: [],
                  required: true
                },
                {
                  model: User,
                  as: 'contactUpdater',
                  attributes: []
                }
              ],
              where,
              raw: true,
              subQuery: false
            };

            const actualContactStatsFindAllFirstArg =
              contactStatsFindAll.getCall(0).args[0];
            expect(
              inspect(actualContactStatsFindAllFirstArg.attributes, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.attributes, {
                depth: null
              }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.group, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.group, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.include, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.where, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.where, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.raw, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              Object.keys(actualContactStatsFindAllFirstArg).length
            ).to.deep.equal(
              Object.keys(expectedContactStatsFindAllArgs).length,
              'Expected value not pass in contact stats find all function'
            );

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

describe('#contactsService - getAllContactStages', function () {
  beforeEach(function () {
    contactStatsFindAll = sinon.stub(Contact, 'findAll');
  });
  afterEach(function () {
    contactStatsFindAll.restore();
  });
  describe('Get Contact stats getAllContactStages count', function () {
    context(
      'Get contact stats getAllContactStages with count data',
      function () {
        it('Should get contact stats getAllContactStages with count when correct params are passed', function (done) {
          //Arrange
          const inputs = {
            projectId: '01'
          };

          const filter = {};

          const contactsStatsFindAllRes = [
            {
              stage: 'string',
              count: 0
            }
          ];

          contactStatsFindAll.returns(contactsStatsFindAllRes);

          // Act
          contactService
            .getAllContactStages(inputs, filter)
            .then(function (result) {
              // Assert
              const actualData = result;
              const expectedData = {
                data: [
                  {
                    stage: 'string',
                    count: 0
                  }
                ],
                totalCount: 0
              };

              const where = {};
              where[`$Account.ProjectId$`] = '01';

              const filterColumnsMapping = {
                companyName: `$Account.name$`,
                domain: `$Account.domain$`,
                accountLabel: `$Account.label$`,
                contactLabel: `$Contact.label$`,
                updatedBy: `$contactUpdater.userName$`
              };

              const expectedBuildWhereClauseArgs = {
                filterColumnsMapping,
                filter,
                where
              };

              expect(actualData).to.deep.equal(expectedData);

              const actualBuildWhereClauseFirstArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
              const actualBuildWhereClauseSecondArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
              const actualBuildWhereClauseThirdArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
              const actualBuildWhereClauseArgsLength =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args
                  .length;

              expect(
                inspect(actualBuildWhereClauseFirstArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
                  depth: null
                }),
                'Expected value not pass in build where clause function'
              );
              expect(
                inspect(actualBuildWhereClauseSecondArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.filter, { depth: null }),
                'Expected value not pass in build where clause function'
              );
              expect(
                inspect(actualBuildWhereClauseThirdArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.where, { depth: null }),
                'Expected value not pass in build where clause function'
              );
              expect(actualBuildWhereClauseArgsLength).to.deep.equal(
                Object.keys(expectedBuildWhereClauseArgs).length,
                'Expected value not pass in build where clause function'
              );

              done();
            })
            .catch(function (err) {
              done(err);
            });
        });

        it('Should throw error when something internally fails', function (done) {
          //Arrange
          const inputs = {
            projectId: '01'
          };

          const filter = {};

          contactStatsFindAll.throws(new Error('Something went wrong'));

          // Act
          contactService
            .getAllContactStages(inputs, filter)
            .then(function (result) {
              const error = new Error(
                'This function could not throw expected error'
              );
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
      }
    );

    context('Validate contact stages stats data query', function () {
      before(function () {
        const contactStatsFindOneWhere = {};
        contactStatsFindOneWhere[`$Account.ProjectId$`] = '01';
        filterHandlerInstanceStub.buildWhereClause = sinon
          .stub()
          .returns(contactStatsFindOneWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const inputs = {
          projectId: '01'
        };

        const filter = {};

        const where = {};
        where[`$Account.ProjectId$`] = '01';

        const contactsStatsFindAllRes = [
          {
            stage: 'string',
            count: 0
          }
        ];

        contactStatsFindAll.returns(contactsStatsFindAllRes);

        // Act
        contactService
          .getAllContactStages(inputs, filter)
          .then(function () {
            // Assert
            const expectedContactStatsFindAllArgs = {
              attributes: ['stage', [sequelize.fn('count', '*'), 'count']],
              group: ['Contact.stage'],
              include: [
                {
                  model: Account,
                  attributes: [],
                  required: true
                },
                {
                  model: User,
                  as: 'contactUpdater',
                  attributes: []
                }
              ],
              where,
              raw: true,
              subQuery: false
            };

            const actualContactStatsFindAllFirstArg =
              contactStatsFindAll.getCall(0).args[0];
            expect(
              inspect(actualContactStatsFindAllFirstArg.attributes, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.attributes, {
                depth: null
              }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.group, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.group, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.include, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.where, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.where, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.raw, { depth: null }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              inspect(actualContactStatsFindAllFirstArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactStatsFindAllArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in contact stats find all function'
            );
            expect(
              Object.keys(actualContactStatsFindAllFirstArg).length
            ).to.deep.equal(
              Object.keys(expectedContactStatsFindAllArgs).length,
              'Expected value not pass in contact stats find all function'
            );

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

describe('#contactsService - getContactDispositions', () => {
  beforeEach(function () {
    contactFindAll = sinon.stub(Contact, 'findAll');
  });
  afterEach(function () {
    contactFindAll.restore();
  });
  describe('Returns list of unique Contact dispositions (Facets)', () => {
    context('When Contact Dispositions are found', () => {
      it('Should return array of dispositions', (done) => {
        // Arrange
        const contactDTO = {
          projectId: '01'
        };

        const expectedResult = [
          'Generic Email',
          'Contact Built',
          'Contact Found: Email Bad'
        ];

        contactFindAll.returns([
          {
            disposition: 'Generic Email'
          },
          {
            disposition: 'Contact Built'
          },
          {
            disposition: 'Contact Found: Email Bad'
          }
        ]);

        contactService
          .getContactDispositions(contactDTO)
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
      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const contactDTO = {
          projectId: '01'
        };

        contactFindAll.throws(new Error('Something went wrong'));

        // Act
        contactService
          .getContactDispositions(contactDTO)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const contactDTO = {
          projectId: '01'
        };

        const expectedContactFindAllInput = {
          attributes: ['Contact.disposition'],
          group: ['Contact.disposition'],
          include: [
            {
              model: Account,
              attributes: [],
              required: true
            }
          ],
          where: {
            '$Account.ProjectId$': contactDTO.projectId
          },
          raw: true
        };

        contactFindAll.returns([
          {
            disposition: 'Generic Email'
          },
          {
            disposition: 'Contact Built'
          },
          {
            disposition: 'Contact Found: Email Bad'
          }
        ]);

        contactService
          .getContactDispositions(contactDTO)
          .then(function () {
            // Assert
            const actualContactFindAllInputFirstArgs =
              contactFindAll.getCall(0).args[0];
            const actualContactFindAllInputArgsLength =
              contactFindAll.getCall(0).args.length;
            const expectedContactFindAllInputArgsLength = 1;
            expect(
              inspect(actualContactFindAllInputFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactFindAllInput, { depth: null })
            );
            expect(actualContactFindAllInputArgsLength).to.equal(
              expectedContactFindAllInputArgsLength
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#contactsService - getContactUpdatedBy', () => {
  beforeEach(function () {
    contactFindAll = sinon.stub(Contact, 'findAll');
  });
  afterEach(function () {
    contactFindAll.restore();
  });
  describe('Returns list of unique Contact updatedBy fields (Facets)', () => {
    context('When Contact UpdatedBy are found', () => {
      it('Should return array of Users', (done) => {
        // Arrange
        const contactDTO = {
          projectId: '01'
        };

        const expectedResult = [
          'agent1@nexsales.com',
          'agent2@nexsales.com',
          'agent3@nexsales.com'
        ];

        contactFindAll.returns([
          {
            userName: 'agent1@nexsales.com'
          },
          {
            userName: 'agent2@nexsales.com'
          },
          {
            userName: 'agent3@nexsales.com'
          }
        ]);

        contactService
          .getContactUpdatedBy(contactDTO)
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
      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const contactDTO = {
          projectId: '01'
        };

        contactFindAll.throws(new Error('Something went wrong'));

        // Act
        contactService
          .getContactUpdatedBy(contactDTO)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const contactDTO = {
          projectId: '01'
        };

        const expectedContactFindAllInput = {
          attributes: ['contactUpdater.userName'],
          group: ['contactUpdater.userName'],
          include: [
            {
              model: Account,
              attributes: [],
              required: true
            },
            {
              model: User,
              as: 'contactUpdater',
              attributes: []
            }
          ],
          where: {
            '$Account.ProjectId$': contactDTO.projectId
          },
          raw: true
        };

        contactFindAll.returns([
          {
            userName: 'agent1@nexsales.com'
          },
          {
            userName: 'agent2@nexsales.com'
          },
          {
            userName: 'agent3@nexsales.com'
          }
        ]);

        contactService
          .getContactUpdatedBy(contactDTO)
          .then(function () {
            // Assert
            const actualContactFindAllInputFirstArgs =
              contactFindAll.getCall(0).args[0];
            const actualContactFindAllInputArgsLength =
              contactFindAll.getCall(0).args.length;
            const expectedContactFindAllInputArgsLength = 1;

            expect(
              inspect(actualContactFindAllInputFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactFindAllInput, { depth: null })
            );
            expect(actualContactFindAllInputArgsLength).to.equal(
              expectedContactFindAllInputArgsLength
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#contactService - getFileIsLarger', () => {
  beforeEach(function () {
    contactsCountMaxRecords = sinon.stub(Contact, 'count');
  });
  afterEach(function () {
    contactsCountMaxRecords.restore();
  });
  describe('Check the size of records for download process selection', () => {
    context(
      'Check the size of the requested payload with the maximum records downloadable with synchronous process',
      () => {
        it('Should return "true" when requested payload size is greater than maximum records', function (done) {
          //Arrange
          const projectId = '01';
          const maximumRecords = 100;
          const filter = {};

          contactsCountMaxRecords.returns(200);

          // Act
          contactService
            .getFileIsLarger(projectId, filter, maximumRecords)
            .then(function (result) {
              // Assert
              const actualValue = result;
              const expectedValue = true;
              const where = {};
              where[`$Account.ProjectId$`] = '01';

              const filterColumnsMapping = {
                companyName: `$Account.name$`,
                domain: `$Account.domain$`,
                accountLabel: `$Account.label$`,
                contactLabel: `$Contact.label$`,
                updatedBy: `$contactUpdater.userName$`
              };

              const expectedBuildWhereClauseArgs = {
                filterColumnsMapping,
                filter,
                where
              };

              expect(actualValue).to.equal(expectedValue);

              const actualBuildWhereClauseFirstArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
              const actualBuildWhereClauseSecondArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
              const actualBuildWhereClauseThirdArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
              const actualBuildWhereClauseArgsLength =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args
                  .length;

              expect(
                inspect(actualBuildWhereClauseFirstArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
                  depth: null
                }),
                'Expected value not pass in build where clause function'
              );
              expect(
                inspect(actualBuildWhereClauseSecondArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.filter, { depth: null }),
                'Expected value not pass in build where clause function'
              );
              expect(
                inspect(actualBuildWhereClauseThirdArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.where, { depth: null }),
                'Expected value not pass in build where clause function'
              );
              expect(actualBuildWhereClauseArgsLength).to.deep.equal(
                Object.keys(expectedBuildWhereClauseArgs).length,
                'Expected value not pass in build where clause function'
              );

              done();
            })
            .catch(function (err) {
              done(err);
            });
        });

        it('Should return "false" when requested payload size is less than maximum records', function (done) {
          //Arrange
          const projectId = '01';
          const maximumRecords = 100;
          const filter = {};

          contactsCountMaxRecords.returns(20);

          // Act
          contactService
            .getFileIsLarger(projectId, filter, maximumRecords)
            .then(function (result) {
              // Assert
              const actualValue = result;
              const expectedValue = false;
              const where = {};
              where[`$Account.ProjectId$`] = '01';

              const filterColumnsMapping = {
                companyName: `$Account.name$`,
                domain: `$Account.domain$`,
                accountLabel: `$Account.label$`,
                contactLabel: `$Contact.label$`,
                updatedBy: `$contactUpdater.userName$`
              };

              const expectedBuildWhereClauseArgs = {
                filterColumnsMapping,
                filter,
                where
              };

              expect(actualValue).to.equal(expectedValue);

              const actualBuildWhereClauseFirstArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
              const actualBuildWhereClauseSecondArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
              const actualBuildWhereClauseThirdArgs =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
              const actualBuildWhereClauseArgsLength =
                filterHandlerInstanceStub.buildWhereClause.getCall(0).args
                  .length;

              expect(
                inspect(actualBuildWhereClauseFirstArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
                  depth: null
                }),
                'Expected value not pass in build where clause function'
              );
              expect(
                inspect(actualBuildWhereClauseSecondArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.filter, { depth: null }),
                'Expected value not pass in build where clause function'
              );
              expect(
                inspect(actualBuildWhereClauseThirdArgs, { depth: null })
              ).to.deep.equal(
                inspect(expectedBuildWhereClauseArgs.where, { depth: null }),
                'Expected value not pass in build where clause function'
              );
              expect(actualBuildWhereClauseArgsLength).to.deep.equal(
                Object.keys(expectedBuildWhereClauseArgs).length,
                'Expected value not pass in build where clause function'
              );

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

          contactsCountMaxRecords.throws(new Error('Something went wrong'));

          // Act
          contactService
            .getFileIsLarger(projectId, filter, maximumRecords)
            .then(function (result) {
              const error = new Error(
                'This function could not throw expected error'
              );
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
      }
    );

    context('Validate contact count data query', () => {
      before(function () {
        const contactsCountMaxRecordsWhere = {};
        contactsCountMaxRecordsWhere[`$Account.ProjectId$`] = '01';
        filterHandlerInstanceStub.buildWhereClause = sinon
          .stub()
          .returns(contactsCountMaxRecordsWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const projectId = '01';
        const maximumRecords = 100;
        const filter = {};

        contactsCountMaxRecords.returns(200);

        const where = {};
        where[`$Account.ProjectId$`] = '01';

        // Act
        contactService
          .getFileIsLarger(projectId, filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedContactsCountMaxRecordsArgs = {
              where: [where],
              include: [
                {
                  model: Account,
                  required: true
                },
                {
                  model: User,
                  as: 'contactUpdater'
                }
              ]
            };

            const actualContactsCountMaxRecordsArgs =
              contactsCountMaxRecords.getCall(0).args[0];
            expect(
              inspect(actualContactsCountMaxRecordsArgs.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactsCountMaxRecordsArgs.include, {
                depth: null
              }),
              'Expected value not pass in contact count for maximum records function'
            );
            expect(
              inspect(actualContactsCountMaxRecordsArgs.where, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactsCountMaxRecordsArgs.where, {
                depth: null
              }),
              'Expected value not pass in contact count for maximum records function'
            );
            expect(
              Object.keys(actualContactsCountMaxRecordsArgs).length
            ).to.deep.equal(
              Object.keys(expectedContactsCountMaxRecordsArgs).length,
              'Expected value not pass in contact count for maximum records function'
            );

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

describe('#contactsService - downloadAllContact', function () {
  beforeEach(function () {
    contactServiceAddFile = sinon.stub(contactService, 'addFile');
    contactServiceEnqueue = sinon.stub(contactService, 'enqueue');
  });
  afterEach(function () {
    contactServiceAddFile.restore();
    contactServiceEnqueue.restore();
  });
  describe('Downloads contacts or submits jobs for downloading contacts', function () {
    context('Process contacts download request', function () {
      it('Should correctly process and download contacts when async download is disabled', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01'
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactExporter.returns(
          'Exported Records Successfully'
        );

        // Act
        contactService
          .downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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
              updatedBy: inputs.userId
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload
            };

            const dbParam = {
              jobId: inputs.jobId,
              projectId: inputs.projectId,
              filter
            };

            const expectedContactExporterArgs = {
              writableStream,
              dbParam
            };

            const actualAddFileFirstArgs =
              contactServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs =
              contactServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength =
              contactServiceAddFile.getCall(0).args.length;

            const actualContactExporterFirstArgs =
              downloadServiceRepo.contactExporter.getCall(0).args[0];
            const actualContactExporterSecondArgs =
              downloadServiceRepo.contactExporter.getCall(0).args[1];
            const actualContactExporterArgsLength =
              downloadServiceRepo.contactExporter.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);

            expect(actualAddFileFirstArgs).to.deep.equal(
              expectedAddFileArgs.fileData,
              'Expected value not pass in add file function'
            );
            expect(actualAddFileSecondArgs).to.deep.equal(
              expectedAddFileArgs.isAsyncDownload,
              'Expected value not pass in add file function'
            );
            expect(actualAddFileArgsLength).to.deep.equal(
              Object.keys(expectedAddFileArgs).length,
              'Expected value not pass in add file function'
            );

            expect(actualContactExporterFirstArgs).to.deep.equal(
              expectedContactExporterArgs.writableStream,
              'Expected value not pass in contact exporter function'
            );
            expect(actualContactExporterSecondArgs).to.deep.equal(
              expectedContactExporterArgs.dbParam,
              'Expected value not pass in contact exporter function'
            );
            expect(actualContactExporterArgsLength).to.deep.equal(
              Object.keys(expectedContactExporterArgs).length,
              'Expected value not pass in contact exporter function'
            );

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
          userId: '01'
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactExporter.returns(
          'Exported Records Successfully'
        );

        // Act
        contactService
          .downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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
              updatedBy: inputs.userId
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload
            };

            const expectedEnqueueArgs = {
              jobId: fileData.jobId,
              projectId: fileData.projectId,
              filter
            };

            const actualAddFileFirstArgs =
              contactServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs =
              contactServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength =
              contactServiceAddFile.getCall(0).args.length;

            const actualEnqueueFirstArgs =
              contactServiceEnqueue.getCall(0).args[0];
            const actualEnqueueSecondArgs =
              contactServiceEnqueue.getCall(0).args[1];
            const actualEnqueueThirdArgs =
              contactServiceEnqueue.getCall(0).args[2];
            const actualEnqueueArgsLength =
              contactServiceEnqueue.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);

            expect(actualAddFileFirstArgs).to.deep.equal(
              expectedAddFileArgs.fileData,
              'Expected value not pass in add file function'
            );
            expect(actualAddFileSecondArgs).to.deep.equal(
              expectedAddFileArgs.isAsyncDownload,
              'Expected value not pass in add file function'
            );
            expect(actualAddFileArgsLength).to.deep.equal(
              Object.keys(expectedAddFileArgs).length,
              'Expected value not pass in add file function'
            );

            expect(actualEnqueueFirstArgs).to.deep.equal(
              expectedEnqueueArgs.jobId,
              'Expected value not pass in enqueue function'
            );
            expect(actualEnqueueSecondArgs).to.deep.equal(
              expectedEnqueueArgs.projectId,
              'Expected value not pass in enqueue function'
            );
            expect(actualEnqueueThirdArgs).to.deep.equal(
              expectedEnqueueArgs.filter,
              'Expected value not pass in enqueue function'
            );
            expect(actualEnqueueArgsLength).to.deep.equal(
              Object.keys(expectedEnqueueArgs).length,
              'Expected value not pass in enqueue function'
            );

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
          userId: '01'
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        contactServiceAddFile.throws(new Error('Something went wrong'));

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactExporter.returns(
          'Exported Records Successfully'
        );

        // Act
        contactService
          .downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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
          userId: '01'
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.throws(new Error('Something went wrong'));

        downloadServiceRepo.contactExporter.returns(
          'Exported Records Successfully'
        );

        // Act
        contactService
          .downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

      it('Should throw error when something internally fails while contacts exports for sync download', function (done) {
        //Arrange
        const inputs = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          userId: '01'
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactExporter.throws(
          new Error('Something went wrong')
        );

        // Act
        contactService
          .downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

describe('#contactService - addFile', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    contactServiceGetProjectName = sinon.stub(contactService, 'getProjectName');
    contactFileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    contactServiceGetProjectName.restore();
    contactFileCreate.restore();
    dateStub.restore();
  });
  describe('Adds File to DB', function () {
    context('File creation in DB', function () {
      it('Should successfully create a file when all correct params are passed during sync download', function (done) {
        //Arrange
        const fileData = {
          projectId: '01',
          fileId: '01',
          jobId: '01',
          createdBy: '01'
        };

        const isAsyncDownload = false;

        contactServiceGetProjectName.returns('test');

        contactFileCreate.returns('File Created Successfully');

        // Act
        contactService
          .addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectedGetProjectNameArgs = {
              projectId: fileData.projectId
            };

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `test_contact_compliance_${new Date(Date.now())}.csv`,
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
                  operation_name: 'syncContactExport',
                  operation_param: {},
                  result_processed: 0,
                  result_imported: 0,
                  result_errored: 0,
                  createdBy: fileData.createdBy,
                  updatedBy: fileData.updatedBy || fileData.createdBy,
                  row_count: 0
                }
              },
              includeObject: {
                include: [
                  {
                    model: Job
                  }
                ]
              }
            };

            const actualGetProjectNameFirstArgs =
              contactServiceGetProjectName.getCall(0).args[0];
            const actualGetProjectNameArgsLength =
              contactServiceGetProjectName.getCall(0).args.length;

            expect(actualMsg).to.equal(expectedMsg);

            expect(actualGetProjectNameFirstArgs).to.deep.equal(
              expectedGetProjectNameArgs.projectId,
              'Expected value not pass in get project name function'
            );
            expect(actualGetProjectNameArgsLength).to.deep.equal(
              Object.keys(expectedGetProjectNameArgs).length,
              'Expected value not pass in get project name function'
            );

            const actualFileCreateFirstArgs =
              contactFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs =
              contactFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength =
              contactFileCreate.getCall(0).args.length;

            expect(
              inspect(actualFileCreateFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectFileCreateArgs.modelObj, { depth: null }),
              'Expected value not pass in file create function'
            );
            expect(
              inspect(actualFileCreateSecondArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectFileCreateArgs.includeObject, { depth: null }),
              'Expected value not pass in file create function'
            );
            expect(actualFileCreateArgsLength).to.equal(
              Object.keys(expectFileCreateArgs).length,
              'Expected value not pass in file create function'
            );

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
          createdBy: '01'
        };

        const isAsyncDownload = true;

        contactServiceGetProjectName.returns('test');

        contactFileCreate.returns('File Created Successfully');

        // Act
        contactService
          .addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectedGetProjectNameArgs = {
              projectId: fileData.projectId
            };

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `test_contact_compliance_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: `files/${
                  fileData.projectId
                }/Export/test_contact_compliance_${new Date(
                  Date.now()
                )}.csv.csv`,
                mapping: {},
                ProjectId: fileData.projectId,
                createdBy: fileData.createdBy,
                updatedBy: fileData.updatedBy || fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Queued',
                  operation_name: 'asyncContactExport',
                  operation_param: {},
                  result_processed: 0,
                  result_imported: 0,
                  result_errored: 0,
                  createdBy: fileData.createdBy,
                  updatedBy: fileData.updatedBy || fileData.createdBy,
                  row_count: 0
                }
              },
              includeObject: {
                include: [
                  {
                    model: Job
                  }
                ]
              }
            };

            const actualGetProjectNameFirstArgs =
              contactServiceGetProjectName.getCall(0).args[0];
            const actualGetProjectNameArgsLength =
              contactServiceGetProjectName.getCall(0).args.length;

            expect(actualMsg).to.equal(expectedMsg);

            expect(actualGetProjectNameFirstArgs).to.deep.equal(
              expectedGetProjectNameArgs.projectId,
              'Expected value not pass in get project name function'
            );
            expect(actualGetProjectNameArgsLength).to.deep.equal(
              Object.keys(expectedGetProjectNameArgs).length,
              'Expected value not pass in get project name function'
            );

            const actualFileCreateFirstArgs =
              contactFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs =
              contactFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength =
              contactFileCreate.getCall(0).args.length;

            expect(
              inspect(actualFileCreateFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectFileCreateArgs.modelObj, { depth: null }),
              'Expected value not pass in file create function'
            );
            expect(
              inspect(actualFileCreateSecondArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectFileCreateArgs.includeObject, { depth: null }),
              'Expected value not pass in file create function'
            );
            expect(actualFileCreateArgsLength).to.equal(
              Object.keys(expectFileCreateArgs).length,
              'Expected value not pass in file create function'
            );

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
          createdBy: '01'
        };

        const isAsyncDownload = true;

        contactServiceGetProjectName.throws(new Error('Something went wrong'));

        contactFileCreate.returns('File Created Successfully');

        // Act
        contactService
          .addFile(fileData, isAsyncDownload)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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
          createdBy: '01'
        };

        const isAsyncDownload = true;

        contactServiceGetProjectName.returns('test');

        contactFileCreate.throws(new Error('Something went wrong'));

        // Act
        contactService
          .addFile(fileData, isAsyncDownload)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

describe('#contactService - getAllContact', function () {
  beforeEach(function () {
    const contactFindAndCountAllWhere = {};
    contactFindAndCountAllWhere[`$Account.ProjectId$`] = '01';
    filterHandlerInstanceStub.buildWhereClause = sinon
      .stub()
      .returns(contactFindAndCountAllWhere);
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
    contactFindAndCountAll = sinon.stub(Contact, 'findAndCountAll');
  });
  afterEach(function () {
    filterHandlerInstanceStub.buildWhereClause = sinon.stub();
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    contactFindAndCountAll.restore();
  });
  describe('Get contacts list with total count of contacts', function () {
    context('Get contacts and its total counts', function () {
      it('Should return contacts and total count', function (done) {
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        contactFindAndCountAll.returns({
          count: 0,
          rows: []
        });

        contactService
          .getAllContact(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              totalCount: 0,
              docs: []
            };
            const where = {};
            where[`$Account.ProjectId$`] = '01';

            const filterColumnsMapping = {
              companyName: `$Account.name$`,
              domain: `$Account.domain$`,
              accountLabel: `$Account.label$`,
              contactLabel: `$Contact.label$`,
              updatedBy: `$contactUpdater.userName$`
            };

            const sortColumnsMapping = {
              companyName: `"Account"."name"`,
              domain: `"Account"."domain"`
            };

            const customSortColumn = {};

            const expectedBuildWhereClauseArgs = {
              filterColumnsMapping,
              filter,
              where
            };

            const order = [];

            const expectedBuildOrderClauseArgs = {
              sortColumnsMapping,
              customSortColumn,
              sort,
              order
            };

            expect(actualData).to.deep.equal(expectedData);

            const actualBuildWhereClauseFirstArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
            const actualBuildWhereClauseSecondArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
            const actualBuildWhereClauseThirdArgs =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
            const actualBuildWhereClauseArgsLength =
              filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

            const actualBuildOrderClauseFirstArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[0];
            const actualBuildOrderClauseSecondArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[1];
            const actualBuildOrderClauseThirdArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[2];
            const actualBuildOrderClauseFourthArgs =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args[3];
            const actualBuildOrderClauseArgsLength =
              sortHandlerInstanceStub.buildOrderClause.getCall(0).args.length;

            expect(
              inspect(actualBuildWhereClauseFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
                depth: null
              }),
              'Expected value not pass in build where clause function'
            );
            expect(
              inspect(actualBuildWhereClauseSecondArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.filter, { depth: null }),
              'Expected value not pass in build where clause function'
            );
            expect(
              inspect(actualBuildWhereClauseThirdArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedBuildWhereClauseArgs.where, { depth: null }),
              'Expected value not pass in build where clause function'
            );
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(
              Object.keys(expectedBuildWhereClauseArgs).length,
              'Expected value not pass in build where clause function'
            );

            expect(actualBuildOrderClauseFirstArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.sortColumnsMapping,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseSecondArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.customSortColumn,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseThirdArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.sort,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseFourthArgs).to.deep.equal(
              expectedBuildOrderClauseArgs.order,
              'Expected value not pass in build order clause function'
            );
            expect(actualBuildOrderClauseArgsLength).to.deep.equal(
              Object.keys(expectedBuildOrderClauseArgs).length,
              'Expected value not pass in build order clause function'
            );

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
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        contactFindAndCountAll.throws(new Error('Something went wrong'));

        // Act
        contactService
          .getAllContact(inputs, filter, sort)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

    context('Validate contact find and count all data query', function () {
      it('Should verify if query payload is valid', function (done) {
        const inputs = {
          projectId: '01',
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        contactFindAndCountAll.returns({
          count: 0,
          rows: []
        });

        const where = {};
        where[`$Account.ProjectId$`] = inputs.projectId;

        const order = [['updatedAt', 'desc']];

        contactService
          .getAllContact(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const expectedContactFindAndCountAllArgs = {
              attributes: [
                'firstName',
                'lastName',
                'jobTitle',
                'disposition',
                'researchStatus',
                'stage',
                'complianceStatus',
                'updatedAt',
                ['label', 'contactLabel'],
                [Sequelize.col('Account.name'), 'companyName'],
                [Sequelize.col('Account.domain'), 'domain'],
                [Sequelize.col('Account.label'), 'accountLabel'],
                [Sequelize.col('contactUpdater.userName'), 'updatedBy']
              ],
              where,
              order,
              include: [
                {
                  model: Account,
                  attributes: [],
                  required: true
                },
                {
                  model: User,
                  as: 'contactUpdater',
                  attributes: []
                }
              ],
              offset: inputs.offset,
              limit: inputs.limit,
              raw: true,
              subQuery: false
            };

            const actualContactFindAndCountAllFirstArg =
              contactFindAndCountAll.getCall(0).args[0];
            expect(
              inspect(actualContactFindAndCountAllFirstArg.attributes, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.attributes, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.order, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.order, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.include, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.include, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.where, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.where, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.limit, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.limit, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.offset, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.offset, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.raw, { depth: null })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.raw, { depth: null }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              inspect(actualContactFindAndCountAllFirstArg.subQuery, {
                depth: null
              })
            ).to.deep.equal(
              inspect(expectedContactFindAndCountAllArgs.subQuery, {
                depth: null
              }),
              'Expected value not pass in contacts find and count all function'
            );
            expect(
              Object.keys(actualContactFindAndCountAllFirstArg).length
            ).to.deep.equal(
              Object.keys(expectedContactFindAndCountAllArgs).length,
              'Expected value not pass in contacts find and count all function'
            );

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#contactService - updateJobStatus', function () {
  beforeEach(function () {
    contactServiceUpdateJobStatus = sinon.stub(Job, 'update');
  });
  afterEach(function () {
    contactServiceUpdateJobStatus.restore();
  });
  describe('Update job status', function () {
    context('Update status based on job result', function () {
      it('Should update job status correctly', function (done) {
        const jobId = '01';
        const status = 'Processed';

        contactServiceUpdateJobStatus.returns('Job Updated Successfully');

        contactService
          .updateJobStatus(jobId, status)
          .then(function (result) {
            // Assert
            const expectedMsg = 'Job Updated Successfully';
            const actualMsg = result;

            const expectedUpdatedJobStatusArgs = {
              jobObj: {
                status
              },
              whereObj: {
                where: {
                  id: jobId
                }
              }
            };

            expect(actualMsg).to.equal(expectedMsg);

            const actualUpdatedJobStatusFirstArgs =
              contactServiceUpdateJobStatus.getCall(0).args[0];
            const actualUpdatedJobStatusSecondArgs =
              contactServiceUpdateJobStatus.getCall(0).args[1];
            const actualUpdatedJobStatusArgsLength =
              contactServiceUpdateJobStatus.getCall(0).args.length;

            expect(
              inspect(actualUpdatedJobStatusFirstArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedUpdatedJobStatusArgs.jobObj, { depth: null }),
              'Expected value not pass in job update function'
            );
            expect(
              inspect(actualUpdatedJobStatusSecondArgs, { depth: null })
            ).to.deep.equal(
              inspect(expectedUpdatedJobStatusArgs.whereObj, { depth: null }),
              'Expected value not pass in job update function'
            );
            expect(actualUpdatedJobStatusArgsLength).to.equal(
              Object.keys(expectedUpdatedJobStatusArgs).length,
              'Expected value not pass in job update function'
            );

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

        contactServiceUpdateJobStatus.throws(new Error('Something went wrong'));

        // Act
        contactService
          .updateJobStatus(jobId, status)
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

describe('#contactService - getProjectName', function () {
  beforeEach(function () {
    contactServiceProjectFindOne = sinon.stub(Project, 'findOne');
  });
  afterEach(function () {
    contactServiceProjectFindOne.restore();
  });
  describe('Get project name', function () {
    context('Fetch name of a project', function () {
      it('Should return name of project when correct params are passed', function (done) {
        const projectId = '01';

        contactServiceProjectFindOne.returns({
          aliasName: 'project1'
        });

        contactService
          .getProjectName(projectId)
          .then(function (result) {
            // Assert
            const expectedValue = 'project1';
            const actualValue = result;

            const expectedGetProjectNameArgs = {
              attributes: ['aliasName'],
              where: [
                {
                  id: projectId
                }
              ]
            };

            expect(actualValue).to.equal(expectedValue);

            const actualGetProjectNameFirstArgs =
              contactServiceProjectFindOne.getCall(0).args[0];

            expect(
              inspect(actualGetProjectNameFirstArgs.attributes, { depth: null })
            ).to.deep.equal(
              inspect(expectedGetProjectNameArgs.attributes, { depth: null }),
              'Expected value not pass in get project name function'
            );
            expect(
              inspect(actualGetProjectNameFirstArgs.where, { depth: null })
            ).to.deep.equal(
              inspect(expectedGetProjectNameArgs.where, { depth: null }),
              'Expected value not pass in get project name function'
            );
            expect(Object.keys(actualGetProjectNameFirstArgs).length).to.equal(
              Object.keys(expectedGetProjectNameArgs).length,
              'Expected value not pass in get project name function'
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting project name', function (done) {
        //Arrange
        const projectId = '01';

        contactServiceProjectFindOne.throws(new Error('Something went wrong'));

        // Act
        contactService
          .getProjectName(projectId)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

describe('#contactService - enqueue', function () {
  describe('Enqueue task in the queue', function () {
    context('Adds the task to the queue for process', function () {
      before(function () {
        cloudTasksClientStub = sinon
          .stub(CloudTasksClient.prototype, 'createTask')
          .returns([
            {
              name: 'task1'
            }
          ]);
      });
      it('Should enqueue task when correct params are passed', function (done) {
        const jobId = '01';
        const projectId = '01';
        const filter = {};

        contactService
          .enqueue(jobId, projectId, filter)
          .then(function (result) {
            const actual = result;
            const expected = undefined;

            const payload = {
              jobId,
              projectId,
              filter
            };

            const task = {
              httpRequest: {
                httpMethod: 'POST',
                url: 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app'
              }
            };
            task.httpRequest.body = Buffer.from(
              JSON.stringify(payload)
            ).toString('base64');
            task.httpRequest.headers = {
              'Content-Type': 'application/json'
            };
            task.httpRequest.oidcToken = {
              serviceAccountEmail:
                'trigger-na0xhcju@da-tf-project-1-1b0f.iam.gserviceaccount.com'
            };

            const expectedRequest = {
              parent:
                'projects/da-tf-project-1-1b0f/locations/us-central1/queues/da-dev-task-queue',
              task
            };

            const actualCloudTaskLinkCreateTaskArgs =
              cloudTasksClientStub.getCall(0).args[0];
            const actualCloudTaskLinkCreateTaskArgsLength = Object.keys(
              cloudTasksClientStub.getCall(0).args[0]
            ).length;

            expect(actual).to.equal(expected);
            expect(actualCloudTaskLinkCreateTaskArgs.parent).to.equal(
              expectedRequest.parent,
              'Expected value not pass in cloud task link create task function'
            );
            expect(actualCloudTaskLinkCreateTaskArgs.task).to.deep.equal(
              expectedRequest.task,
              'Expected value not pass in cloud task link create task function'
            );
            expect(actualCloudTaskLinkCreateTaskArgsLength).to.equal(
              Object.keys(expectedRequest).length,
              'Expected value not pass in cloud task link create task function'
            );
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
        cloudTasksClientStub = sinon
          .stub(CloudTasksClient.prototype, 'createTask')
          .throws(new Error('Something went wrong'));
      });
      it('Should throw error when something internally fails while enqueueing task', function (done) {
        const jobId = '01';
        const projectId = '01';
        const filter = {};

        contactService
          .enqueue(jobId, projectId, filter)
          .then(function (result) {
            const error = new Error(
              'This function could not throw expected error'
            );
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

describe('#contactService - checkContactSuppressionAndDuplicate', function () {
  describe('Returns a contactDupSupResult for given contact', function () {
    beforeEach(() => {
      contactDTO = {
        id: '6087dc463e5c26006f114f2o',
        firstName: 'Kelly',
        middleName: 'as',
        lastName: 'Timpson',
        email: 'kelly.timpson@active.com',
        phone: '9873456727',
        duplicateOf: '',
        companyDedupeKey: 'kellytimpsonactive',
        emailDedupeKey: 'kellytimpsonactivecom',
        phoneDedupeKey: 'kellytimpson9873456727',
        emailNameDedupeKey: 'kellytimpson',
        emailDomainDedupeKey: 'active.com',
        ProjectId: '01'
      };
      inputsDTO = {
        checkSuppression: true,
        checkDuplicate: true
      };

      duplicateContact = {
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
      suppressionContact = {
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

      duplicateCheckExpectedResult = {
        isDuplicate: false,
        duplicateMatchCase: 'NONE',
        duplicateWith: null
      };

      suppressionCheckExpectedResult = {
        isSuppressed: false,
        suppressionMatchCase: 'NONE',
        suppressedWith: null,
        isFuzzySuppressed: false,
        fuzzyMatchCase: 'NONE',
        fuzzyMatches: null
      };

      expectedResult = {
        matchType: '',
        matchCase: '',
        matchWith: {}
      };
      expectedResultKeys = Object.keys(expectedResult);
    });
    afterEach(() => {});

    context('When given contact is duplicate', function () {
      it('Should return a contactDupSupResult matchType DUPLICATE', function (done) {
        //Arrange

        //set duplicateCheckExpectedResult
        duplicateCheckExpectedResult.isDuplicate = true;
        duplicateCheckExpectedResult.duplicateMatchCase = 'EMAIL';
        duplicateCheckExpectedResult.duplicateWith = duplicateContact;

        //set expectedResult
        expectedResult.matchType = 'duplicate';
        expectedResult.matchCase =
          duplicateCheckExpectedResult.duplicateMatchCase;
        expectedResult.matchWith = duplicateCheckExpectedResult.duplicateWith;

        //stub returns
        contactCheckServiceInstanceStub.check.returns({
          duplicateCheckResult: duplicateCheckExpectedResult,
          suppressionCheckResult: suppressionCheckExpectedResult
        });

        contactService
          .checkContactSuppressionAndDuplicate(contactDTO, inputsDTO)
          .then((res) => {
            let actualResult = res;

            //Assert
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.include.all.keys(expectedResultKeys);
            expect(actualResult).to.deep.equal(
              expectedResult,
              'Contact Duplicate Result differs'
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('When given contact is Exact_Suppressed', function () {
      it('Should return a contactDupSupResult matchType EXACT_SUPPRESSED', function (done) {
        //Arrange

        //set suppressionCheckExpectedResult
        suppressionCheckExpectedResult.isSuppressed = true;
        suppressionCheckExpectedResult.suppressionMatchCase = 'EMAIL';
        suppressionCheckExpectedResult.suppressedWith = suppressionContact;

        //set expectedResult
        expectedResult.matchType = 'Exact Suppressed';
        expectedResult.matchCase =
          suppressionCheckExpectedResult.suppressionMatchCase;
        expectedResult.matchWith =
          suppressionCheckExpectedResult.suppressedWith;

        //stub returns
        contactCheckServiceInstanceStub.check.returns({
          duplicateCheckResult: duplicateCheckExpectedResult,
          suppressionCheckResult: suppressionCheckExpectedResult
        });

        contactService
          .checkContactSuppressionAndDuplicate(contactDTO, inputsDTO)
          .then((res) => {
            let actualResult = res;

            //Assert
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.include.all.keys(expectedResultKeys);
            expect(actualResult).to.deep.equal(
              expectedResult,
              'Contact Exact-Suppression Result differs'
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    context('When given contact is Fuzzy_Suppressed', function () {
      it('Should return a contactDupSupResult matchType FUZZY_SUPPRESSED', function (done) {
        //Arrange

        //set suppressionCheckExpectedResult
        suppressionCheckExpectedResult.isFuzzySuppressed = true;
        suppressionCheckExpectedResult.fuzzyMatchCase = 'EMAIL';
        suppressionCheckExpectedResult.fuzzyMatches = suppressionContact;

        //set expectedResult
        expectedResult.matchType = 'Fuzzy Suppressed';
        expectedResult.matchCase =
          suppressionCheckExpectedResult.fuzzyMatchCase;
        expectedResult.matchWith = suppressionCheckExpectedResult.fuzzyMatches;

        //stub returns
        contactCheckServiceInstanceStub.check.returns({
          duplicateCheckResult: duplicateCheckExpectedResult,
          suppressionCheckResult: suppressionCheckExpectedResult
        });

        contactService
          .checkContactSuppressionAndDuplicate(contactDTO, inputsDTO)
          .then((res) => {
            let actualResult = res;

            //Assert
            expect(actualResult).to.be.an('object');
            expect(actualResult).to.include.all.keys(expectedResultKeys);
            expect(actualResult).to.deep.equal(
              expectedResult,
              'Contact Exact-Suppression Result differs'
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });
});
