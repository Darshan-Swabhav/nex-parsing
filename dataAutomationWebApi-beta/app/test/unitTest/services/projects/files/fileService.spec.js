const {
  expect
} = require('chai');
const sinon = require('sinon');
const {
  inspect
} = require('util');
const proxyquire = require('proxyquire');
const {
  AccountSuppression,
  ContactSuppression,
  Project,
  File,
  FileChunk,
  SharedFile,
  User,
  Client,
  Job,
  JobError,
  sequelize,
  Sequelize,
} = require('@nexsalesdev/dataautomation-datamodel');

const {
  Op
} = Sequelize;

const { Storage } = require('@google-cloud/storage');

const filterHandlerInstanceStub = {
  buildWhereClause: sinon.stub(),
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  buildOrderClause: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const settingsConfig = {
  logger: {
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
  },
};

const FileService = proxyquire('../../../../../services/projects/files/fileService', {
  '../../../config/settings/settings-config': settingsConfig,
  '@nexsalesdev/dataautomation-datamodel/lib/services/filterHandler': FilterHandlerStub,
  '@nexsalesdev/dataautomation-datamodel/lib/services/sortHandler': SortHandlerStub,
});

const process = {
  env: {
    GCLOUD_STORAGE_SUPPORT_FILE_BUCKET: '',
    GCLOUD_STORAGE_PROCESS_FILE_BUCKET: ''
  }
};

const fileService = new FileService();

let sharedFileFindAll,
  sharedFileDestroy,
  fileDestroy,
  fileServiceSharedFileFindOne,
  fileServiceFileFindOne,
  fileServiceJobFindOne,
  fileServiceJobErrorDestroy,
  fileServiceJobDestroy,
  fileServiceFileChunkDestroy,
  fileServiceGetJobByFileId,
  fileServiceDeleteSuppressionJobErrors,
  fileServiceAccountSuppression,
  fileServiceContactSuppression,
  existsStub,
  bucketStub,
  fileServiceDeleteSuppressionRecords,
  fileServiceDeleteSuppressionFileJob,
  filesFindAll,
  deleteStub,
  gcpCloudStorageSupportBucketStub,
  gcpCloudStorageProcessBucketStub,
  fileServiceDeleteSuppressionFileChunks;


describe('#fileService - getAllFile', () => {
  describe('Returns list of All File data', () => {
    const inputs = {
      projectId: 'abc'
    };
    let fileFindAll, sharedFileFindAll;

    beforeEach(function () {
      fileFindAll = sinon.stub(File, 'findAll');
      sharedFileFindAll = sinon.stub(SharedFile, 'findAll');
    });
    afterEach(function () {
      fileFindAll.restore();
      sharedFileFindAll.restore();
    });
    context('Check If get some errors while getting file data from DB', () => {
      it('Should throw error', (done) => {
        fileFindAll.throws(new Error('Something went wrong in getting file data from DB'));
        // Act
        fileService.getAllFile(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in getting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get some errors while getting shardFile data from DB', () => {
      it('Should throw error', (done) => {
        sharedFileFindAll.throws(new Error('Something went wrong in getting sharedFile data from DB'));

        // Act
        fileService.getAllFile(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in getting sharedFile data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get all file data from DB', () => {
      it('Should return list of All file data', (done) => {
        // Arrange
        fileFindAll.returns([{
          name: 'file1'
        }]);
        sharedFileFindAll.returns([{
          name: 'file2'
        }]);

        // Act
        fileService.getAllFile(inputs)
          .then(function (result) {
            // Arrange
            const actualResult = result;
            const expectedResult = [{
              name: 'file1'
            }, {
              name: 'file2'
            }];

            const actualInputOfFileFindAll = fileFindAll.getCall(0).args;
            const expectedInputOfFileFindAll = [{
              where: {
                ProjectId: inputs.projectId,
                type: {
                  [Op.ne]: 'Suppression',
                },
              },
              attributes: ['id', 'name', 'type', 'mapping'],
              raw: true,
            }];

            const actualInputOfSharedFileFindAll = sharedFileFindAll.getCall(0).args;
            const expectedInputOfSharedFileFindAll = [{
              attributes: ['id', 'name', 'type', 'mapping'],
              include: [{
                model: Project,
                attributes: [],
                where: {
                  id: inputs.projectId,
                },
                through: {
                  attributes: [],
                },
              }, ],
              raw: true,
            }];

            // Assert
            expect(inspect(actualInputOfFileFindAll, {
              depth: null
            })).to.deep.equal(inspect(expectedInputOfFileFindAll, {
              depth: null
            }), 'Expected Query not use for getting file data');
            expect(inspect(actualInputOfSharedFileFindAll, {
              depth: null
            })).to.deep.equal(inspect(expectedInputOfSharedFileFindAll, {
              depth: null
            }), 'Expected Query not use for getting file data');
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - getAllSharedFile', () => {
  describe('Returns list of Shared File data and Count of total Shared Files', () => {
    const inputs = {
      limit: '10',
      offset: '0',
      filter: {
        fileName: {
          operator: '=',
          value: 'abc'
        }
      },
      sort: {
        fileName: 'asc'
      },
    };

    let sharedFileCount, sharedFileFindAll;
    const returnValueOfBuildWhereClause = {
      '$SharedFile.name$': 'abc'
    };
    const returnValueOfBuildOrderClause = [
      [sequelize.literal('"SharedFile"."name"'), 'asc']
    ];

    beforeEach(function () {
      sharedFileCount = sinon.stub(SharedFile, 'count');
      sharedFileFindAll = sinon.stub(SharedFile, 'findAll');
    });
    afterEach(function () {
      sharedFileCount.restore();
      sharedFileFindAll.restore();
    });

    before(function () {
      filterHandlerInstanceStub.buildWhereClause.returns(returnValueOfBuildWhereClause);
      sortHandlerInstanceStub.buildOrderClause.returns(returnValueOfBuildOrderClause);
    });
    after(function () {
      filterHandlerInstanceStub.buildWhereClause = sinon.stub();
      sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    });
    context('Check If get some errors while counting shared files from DB', () => {
      it('Should throw error', (done) => {
        sharedFileCount.throws(new Error('Something went wrong in counting shared file from DB'));

        // Act
        fileService.getAllSharedFile(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in counting shared file from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get some errors while getting sharedFile data from DB', () => {
      it('Should throw error', (done) => {
        sharedFileFindAll.throws(new Error('Something went wrong in getting shared file data from DB'));

        // Act
        fileService.getAllSharedFile(inputs)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in getting shared file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check If get all shared file data and count of shared files from DB', () => {
      it('Should return list of Shared File data and Count of total Shared Files', (done) => {
        // Arrange
        sharedFileCount.returns(10);
        sharedFileFindAll.returns([{
          name: 'file2'
        }]);

        // Act
        fileService.getAllSharedFile(inputs)
          .then(function (result) {
            // Arrange
            const actualResult = result;
            const expectedResult = {
              totalCount: 10,
              docs: [{
                name: 'file2'
              }]
            };
            const filterColumnsMapping = {
              fileName: `$SharedFile.name$`,
              client: `$Client.name$`,
              createdBy: `$sharedFileCreator.userName$`,
              createdAt: `$SharedFile.createdAt$`,
              projectName: `$Projects.name$`,
            };
            const where = {};
            const actualInputOfBuildWhereClause = filterHandlerInstanceStub.buildWhereClause.getCall(0).args;
            const expectedInputOfBuildWhereClause = [filterColumnsMapping, inputs.filter, where];

            const sortColumnsMapping = {
              fileName: `"SharedFile"."name"`,
              createdBy: `"sharedFileCreator"."userName"`,
              createdAt: `"SharedFile"."createdAt"`,
            }
            const customSortColumn = {};
            const order = [];
            const actualInputOfBuildOrderClause = sortHandlerInstanceStub.buildOrderClause.getCall(0).args;
            const expectedInputOfBuildOrderClause = [sortColumnsMapping, customSortColumn, inputs.sort, order];

            const actualInputOfSharedFileCount = sharedFileCount.getCall(0).args;
            const expectedInputOfSharedFileCount = [{
              include: [{
                  model: Project,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
                {
                  model: Client,
                  attributes: [],
                  required: true,
                },
                {
                  model: User,
                  as: 'sharedFileCreator',
                  attributes: [],
                  required: true,
                },
              ],
              where: returnValueOfBuildWhereClause,
              distinct: true,
              col: 'id',
              subQuery: false,
            }];

            const actualInputOfSharedFileFindAll = sharedFileFindAll.getCall(0).args;
            const expectedInputOfSharedFileFindAll = [{
              attributes: [
                ['id', 'sharedFileId'],
                ['name', 'fileName'],
                'createdAt',
                [Sequelize.col('Client.name'), 'client'],
                [Sequelize.col('sharedFileCreator.userName'), 'createdBy'],
                [
                  Sequelize.literal(`ARRAY_REMOVE(ARRAY_AGG("Projects"."name"),null)`),
                  'linkedProjects',
                ],
                [Sequelize.literal(`COUNT("Projects"."name")`), 'linkedProjectCount'],
              ],
              include: [{
                  model: Project,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
                {
                  model: Client,
                  attributes: [],
                  required: true,
                },
                {
                  model: User,
                  as: 'sharedFileCreator',
                  attributes: [],
                  required: true,
                },
              ],
              group: ['sharedFileId', 'Client.id', 'sharedFileCreator.id'],
              where: returnValueOfBuildWhereClause,
              order: returnValueOfBuildOrderClause,
              limit: inputs.limit,
              offset: inputs.offset,
              subQuery: false,
            }];

            expect(actualInputOfBuildWhereClause).to.deep.equal(expectedInputOfBuildWhereClause, 'Expected value not pass in buildWhereClause function');
            expect(actualInputOfBuildOrderClause).to.deep.equal(expectedInputOfBuildOrderClause, 'Expected value not pass in buildOrderClause function');
            expect(inspect(actualInputOfSharedFileCount, {
              depth: null
            })).to.deep.equal(inspect(expectedInputOfSharedFileCount, {
              depth: null
            }), 'Expected Query not use for counting shared file');
            expect(inspect(actualInputOfSharedFileFindAll, {
              depth: null
            })).to.deep.equal(inspect(expectedInputOfSharedFileFindAll, {
              depth: null
            }), 'Expected Query not use for getting shared file data');
            expect(actualResult).to.deep.equal(expectedResult);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - getClients', () => {
  beforeEach(function () {
    sharedFileFindAll = sinon.stub(SharedFile, 'findAll');
  });
  afterEach(function () {
    sharedFileFindAll.restore()
  });
  describe('Returns list of unique File Clients (Facets)', () => {
    context('When File Clients are found', () => {
      it('Should return array of clients', (done) => {
        // Arrange
        const expectedResult = [
          'xin-xin',
          'Vonage',
          'Tpg',
        ];

        sharedFileFindAll.returns([{
            client: 'xin-xin'
          },
          {
            client: 'Vonage'
          },
          {
            client: 'Tpg'
          },
        ]);

        fileService.getClients().then(function (result) {
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
        sharedFileFindAll.throws(new Error('Something went wrong'));

        // Act
        fileService
          .getClients()
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

      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const expectedsharedFileFindAllInput = {
          attributes: [
            [Sequelize.col('Client.name'), 'client']
          ],
          include: [{
            model: Client,
            attributes: [],
            required: true,
          }, ],
          group: ['Client.id'],
          raw: true,
          subQuery: false,
        };

        sharedFileFindAll.returns([{
            client: 'xin-xin'
          },
          {
            client: 'Vonage'
          },
          {
            client: 'Tpg'
          },
        ]);

        fileService.getClients()
          .then(function () {
            // Assert
            const actualsharedFileFindAllInputFirstArgs = sharedFileFindAll.getCall(0).args[0];
            expect(inspect(actualsharedFileFindAllInputFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedsharedFileFindAllInput, {
              depth: null
            }), 'Expected value not pass in get client function');
            expect(Object.keys(actualsharedFileFindAllInputFirstArgs).length).to.deep.equal(Object.keys(expectedsharedFileFindAllInput).length, 'Expected value not pass in get client function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - getCreatedBy', () => {
  beforeEach(function () {
    sharedFileFindAll = sinon.stub(SharedFile, 'findAll');
  });
  afterEach(function () {
    sharedFileFindAll.restore()
  });
  describe('Returns list of unique File createdBy fields (Facets)', () => {
    context('When File createdBy are found', () => {
      it('Should return array of Users', (done) => {
        // Arrange
        const expectedResult = [
          'agent1@nexsales.com',
          'agent2@nexsales.com',
          'agent3@nexsales.com',
        ];

        sharedFileFindAll.returns([{
            createdBy: 'agent1@nexsales.com'
          },
          {
            createdBy: 'agent2@nexsales.com'
          },
          {
            createdBy: 'agent3@nexsales.com'
          },
        ]);

        fileService.getCreatedBy().then(function (result) {
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
        sharedFileFindAll.throws(new Error('Something went wrong'));

        // Act
        fileService
          .getCreatedBy()
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

      it('Should verify query arguments for DB operation', function (done) {
        // Arrange

        const expectedsharedFileFindAllInput = {
          attributes: [
            [Sequelize.col('sharedFileCreator.userName'), 'createdBy']
          ],
          include: [{
            model: User,
            as: 'sharedFileCreator',
            attributes: [],
            required: true,
          }, ],
          group: ['sharedFileCreator.id'],
          raw: true,
          subQuery: false,
        };

        sharedFileFindAll.returns([{
            createdBy: 'agent1@nexsales.com'
          },
          {
            createdBy: 'agent2@nexsales.com'
          },
          {
            createdBy: 'agent3@nexsales.com'
          },
        ]);

        fileService.getCreatedBy()
          .then(function () {
            // Assert
            const actualsharedFileFindAllInputFirstArgs = sharedFileFindAll.getCall(0).args[0];

            expect(inspect(actualsharedFileFindAllInputFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedsharedFileFindAllInput, {
              depth: null
            }), 'Expected value not pass in get File users function');
            expect(Object.keys(actualsharedFileFindAllInputFirstArgs).length).to.deep.equal(Object.keys(expectedsharedFileFindAllInput).length, 'Expected value not pass in get File users function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - deleteFile', () => {
  beforeEach(function () {
    sharedFileDestroy = sinon.stub(SharedFile, 'destroy');
    fileDestroy = sinon.stub(File, 'destroy');
  });
  afterEach(function () {
    sharedFileDestroy.restore()
    fileDestroy.restore()
  });
  describe('Deleting a SharedFile from DB table using File ID', () => {
    context('Check if errors are caught while deleting data from DB', () => {
      it('SharedFile delete should return error', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
          sharedFile: true,
        };
        sharedFileDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteFile(inputs.fileId, inputs.sharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('File delete should return error', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
          sharedFile: false,
        };
        fileDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteFile(inputs.fileId, inputs.sharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if File is deleted from DB', () => {
      it('Should return deleted SharedFile', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
          sharedFile: true,
        };
        const sharedFileDeleteInputs = {
          where: [{
            id: inputs.fileId,
          }, ],
        };
        sharedFileDestroy.returns('deleted successfully');

        // Act
        fileService.deleteFile(inputs.fileId, inputs.sharedFile)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(sharedFileDestroy.calledWithExactly(sharedFileDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should return deleted File', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
          sharedFile: false,
        };

        const fileDeleteInputs = {
          where: [{
            id: inputs.fileId,
          }, ],
        };
        fileDestroy.returns('deleted successfully');

        // Act
        fileService.deleteFile(inputs.fileId, inputs.sharedFile)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(fileDestroy.calledWithExactly(fileDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - getFileById', function () {
  beforeEach(function () {
    fileServiceSharedFileFindOne = sinon.stub(SharedFile, 'findOne');
    fileServiceFileFindOne = sinon.stub(File, 'findOne');
  });
  afterEach(function () {
    fileServiceSharedFileFindOne.restore();
    fileServiceFileFindOne.restore();
  });
  describe('Get File', function () {
    context('Fetch File from DB', function () {
      it('Should return File when correct params are passed', function (done) {
        const fileId = '01';

        fileServiceFileFindOne.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Suppression",
        });

        fileService.getFileById(fileId)
          .then(function (result) {
            // Assert
            const expectedValue = {
              id: "01",
              mapping: {
                name: 'Name',
                zoomInfoName: 'SFDC Company Name',
                address: 'address',
              },
              name: "Suppressed Accounts",
              type: "Suppression",
            };
            const actualValue = result;
            const expectedGetFileByIdArgs = {
              where: {
                id: fileId,
              },
              raw: true,
            };

            expect(actualValue).to.deep.equal(expectedValue);

            const actualGetFileByIDArgs = fileServiceFileFindOne.getCall(0).args[0];

            expect(inspect(actualGetFileByIDArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedGetFileByIdArgs, {
              depth: null
            }), 'Expected value not pass in get file by id function');
            expect(Object.keys(actualGetFileByIDArgs).length).to.equal(Object.keys(expectedGetFileByIdArgs).length, 'Expected value not pass in get file by id function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting file', function (done) {
        //Arrange
        const fileId = '01';

        fileServiceFileFindOne.throws(new Error('Something went wrong'));

        // Act
        fileService.getFileById(fileId)
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
    context('Fetch SharedFile from DB', function () {
      it('Should return SharedFile when correct params are passed', function (done) {
        const fileId = '01';

        fileServiceFileFindOne.returns(null);
        fileServiceSharedFileFindOne.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Suppression",
        });

        fileService.getFileById(fileId)
          .then(function (result) {
            // Assert
            const expectedValue = {
              id: "01",
              mapping: {
                name: 'Name',
                zoomInfoName: 'SFDC Company Name',
                address: 'address',
              },
              name: "Suppressed Accounts",
              type: "Suppression",
            };
            const actualValue = result;
            const expectedGetFileByIdArgs = {
              where: {
                id: fileId,
              },
              raw: true,
            };

            expect(actualValue).to.deep.equal(expectedValue);

            const actualGetFileByIDArgs = fileServiceSharedFileFindOne.getCall(0).args[0];

            expect(inspect(actualGetFileByIDArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedGetFileByIdArgs, {
              depth: null
            }), 'Expected value not pass in get file by id function');
            expect(Object.keys(actualGetFileByIDArgs).length).to.equal(Object.keys(expectedGetFileByIdArgs).length, 'Expected value not pass in get file by id function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting file', function (done) {
        //Arrange
        const fileId = '01';

        fileServiceSharedFileFindOne.throws(new Error('Something went wrong'));

        // Act
        fileService.getFileById(fileId)
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

describe('#fileService - getJobByFileId', function () {
  beforeEach(function () {
    fileServiceJobFindOne = sinon.stub(Job, 'findOne');
  });
  afterEach(function () {
    fileServiceJobFindOne.restore();
  });
  describe('Get Job by File Id', function () {
    context('Fetch Job from DB using SharedFile Id', function () {
      it('Should return Job when correct params are passed', function (done) {
        const fileId = '01';
        const isSharedFile = true;

        fileServiceJobFindOne.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "contactSuppression",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Queued",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileService.getJobByFileId(fileId, isSharedFile)
          .then(function (result) {
            // Assert
            const expectedValue = {
              chunks: "6",
              createdAt: "2019-07-17T03:24:00.000Z",
              fileId: "01",
              fileName: "Suppressed Accounts",
              jobId: "01",
              operation_name: "contactSuppression",
              result_errored: "0",
              result_imported: "600",
              result_processed: "600",
              row_count: "600",
              status: "Queued",
              updatedAt: "2019-07-17T03:24:00.000Z",
            };
            const actualValue = result;
            const expectedGetJobByFileIdArgs = {
              where: {
                SharedFileId: fileId,
              },
              raw: true,
            };

            expect(actualValue).to.deep.equal(expectedValue);

            const actualGetJobByFileIDArgs = fileServiceJobFindOne.getCall(0).args[0];

            expect(inspect(actualGetJobByFileIDArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedGetJobByFileIdArgs, {
              depth: null
            }), 'Expected value not pass in get job by file id function');
            expect(Object.keys(actualGetJobByFileIDArgs).length).to.equal(Object.keys(expectedGetJobByFileIdArgs).length, 'Expected value not pass in get job by file id function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting file', function (done) {
        //Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceJobFindOne.throws(new Error('Something went wrong'));

        // Act
        fileService.getJobByFileId(fileId, isSharedFile)
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
    context('Fetch Job from DB using File id', function () {
      it('Should return Job when correct params are passed', function (done) {
        const fileId = '01';
        const isSharedFile = false;

        fileServiceJobFindOne.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "contactSuppression",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Queued",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileService.getJobByFileId(fileId, isSharedFile)
          .then(function (result) {
            // Assert
            const expectedValue = {
              chunks: "6",
              createdAt: "2019-07-17T03:24:00.000Z",
              fileId: "01",
              fileName: "Suppressed Accounts",
              jobId: "01",
              operation_name: "contactSuppression",
              result_errored: "0",
              result_imported: "600",
              result_processed: "600",
              row_count: "600",
              status: "Queued",
              updatedAt: "2019-07-17T03:24:00.000Z",
            };
            const actualValue = result;
            const expectedGetJobByFileIdArgs = {
              where: {
                FileId: fileId,
              },
              raw: true,
            };

            expect(actualValue).to.deep.equal(expectedValue);

            const actualGetJobByFileIDArgs = fileServiceJobFindOne.getCall(0).args[0];

            expect(inspect(actualGetJobByFileIDArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedGetJobByFileIdArgs, {
              depth: null
            }), 'Expected value not pass in get job by file id function');
            expect(Object.keys(actualGetJobByFileIDArgs).length).to.equal(Object.keys(expectedGetJobByFileIdArgs).length, 'Expected value not pass in get job by file id function');
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while getting file', function (done) {
        //Arrange
        const fileId = '01';
        const isSharedFile = false;

        fileServiceJobFindOne.throws(new Error('Something went wrong'));

        // Act
        fileService.getJobByFileId(fileId, isSharedFile)
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

describe('#fileService - deleteSuppressionJobErrors', function () {
  beforeEach(function () {
    fileServiceJobErrorDestroy = sinon.stub(JobError, 'destroy');
  });
  afterEach(function () {
    fileServiceJobErrorDestroy.restore();
  });
  describe('Deleting a JobError from DB table using Job ID', function () {
    context('Check If get some errors while deleting data from DB', function () {
      it('JobError delete should return error', (done) => {
        // Arrange
        const inputs = {
          jobId: '111'
        };
        fileServiceJobErrorDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteSuppressionJobErrors(inputs.jobId)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if JobError is deleted from DB', () => {
      it('Should return deleted JobError', (done) => {
        // Arrange
        const inputs = {
          jobId: '111',
        };

        const jobErrorDeleteInputs = {
          where: [{
            JobId: inputs.jobId,
          }, ],
        };
        fileServiceJobErrorDestroy.returns('deleted successfully');

        // Act
        fileService.deleteSuppressionJobErrors(inputs.jobId)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(fileServiceJobErrorDestroy.calledWithExactly(jobErrorDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - deleteSuppressionFileJob', function () {
  beforeEach(function () {
    fileServiceJobDestroy = sinon.stub(Job, 'destroy');
  });
  afterEach(function () {
    fileServiceJobDestroy.restore();
  });
  describe('Deleting a Job from DB table using Shared File ID', function () {
    context('Check If get some errors while deleting data from DB', function () {
      it('Job delete should return error', (done) => {
        // Arrange
        const inputs = {
          fileId: '111'
        };
        const isSharedFile = true;
        fileServiceJobDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteSuppressionFileJob(inputs.fileId, isSharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if Job is deleted from DB using Shared File ID', () => {
      it('Should return deleted Job', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
        };
        const isSharedFile = true;

        const jobDeleteInputs = {
          where: [{
            SharedFileId: inputs.fileId,
          }, ],
        };
        fileServiceJobDestroy.returns('deleted successfully');

        // Act
        fileService.deleteSuppressionFileJob(inputs.fileId, isSharedFile)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(fileServiceJobDestroy.calledWithExactly(jobDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
  describe('Deleting a Job from DB table using File ID', function () {
    context('Check If get some errors while deleting data from DB', function () {
      it('Job delete should return error', (done) => {
        // Arrange
        const inputs = {
          fileId: '111'
        };
        const isSharedFile = false;
        fileServiceJobDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteSuppressionFileJob(inputs.fileId, isSharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if Job is deleted from DB using File ID', () => {
      it('Should return deleted Job', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
        };
        const isSharedFile = false;

        const jobDeleteInputs = {
          where: [{
            FileId: inputs.fileId,
          }, ],
        };
        fileServiceJobDestroy.returns('deleted successfully');

        // Act
        fileService.deleteSuppressionFileJob(inputs.fileId, isSharedFile)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(fileServiceJobDestroy.calledWithExactly(jobDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - deleteSuppressionFileChunks', function () {
  beforeEach(function () {
    fileServiceFileChunkDestroy = sinon.stub(FileChunk, 'destroy');
  });
  afterEach(function () {
    fileServiceFileChunkDestroy.restore();
  });
  describe('Deleting a FileChunk from DB table using Shared File ID', function () {
    context('Check If get some errors while deleting data from DB', function () {
      it('FileChunk delete should return error', (done) => {
        // Arrange
        const inputs = {
          fileId: '111'
        };
        const isSharedFile = true;
        fileServiceFileChunkDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteSuppressionFileChunks(inputs.fileId, isSharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if FileChunk is deleted from DB using Shared File ID', () => {
      it('Should return deleted FileChunk', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
        };
        const isSharedFile = true;

        const fileChunkDeleteInputs = {
          where: [{
            SharedFileId: inputs.fileId,
          }, ],
        };
        fileServiceFileChunkDestroy.returns('deleted successfully');

        // Act
        fileService.deleteSuppressionFileChunks(inputs.fileId, isSharedFile)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(fileServiceFileChunkDestroy.calledWithExactly(fileChunkDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
  describe('Deleting a FileChunk from DB table using File ID', function () {
    context('Check If get some errors while deleting data from DB', function () {
      it('FileChunk delete should return error', (done) => {
        // Arrange
        const inputs = {
          fileId: '111'
        };
        const isSharedFile = false;
        fileServiceFileChunkDestroy.throws(new Error('Something went wrong in deleting file data from DB'));

        // Act
        fileService.deleteSuppressionFileChunks(inputs.fileId, isSharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `Something went wrong in deleting file data from DB`;

            expect(actualErrMsg).to.equal(expectedErrMsg);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
    context('Check if FileChunk is deleted from DB using File ID', () => {
      it('Should return deleted FileChunk', (done) => {
        // Arrange
        const inputs = {
          fileId: '111',
        };
        const isSharedFile = false;

        const fileChunkDeleteInputs = {
          where: [{
            FileId: inputs.fileId,
          }, ],
        };
        fileServiceFileChunkDestroy.returns('deleted successfully');

        // Act
        fileService.deleteSuppressionFileChunks(inputs.fileId, isSharedFile)
          .then(function (result) {
            // Assert
            const actualResult = result;
            const expectedResult = 'deleted successfully';

            expect(fileServiceFileChunkDestroy.calledWithExactly(fileChunkDeleteInputs)).to.equal(true);
            expect(actualResult).to.deep.equal(expectedResult);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});

describe('#fileService - deleteSuppressionRecords', function () {
  beforeEach(function () {
    fileServiceGetJobByFileId = sinon.stub(fileService, 'getJobByFileId');
    fileServiceDeleteSuppressionJobErrors = sinon.stub(fileService, 'deleteSuppressionJobErrors');
    fileServiceAccountSuppression = sinon.stub(AccountSuppression, 'destroy');
    fileServiceContactSuppression = sinon.stub(ContactSuppression, 'destroy');
  });
  afterEach(function () {
    fileServiceGetJobByFileId.restore();
    fileServiceDeleteSuppressionJobErrors.restore();
    fileServiceAccountSuppression.restore();
    fileServiceContactSuppression.restore();
  });
  describe('Deleting a Suppression File from DB table using File ID', function(){
    context('Check if errors are caught while deleting data from DB', function(){
      it('Should throw error when getJobByFileId fails while deleting a file', function (done) {
        //Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceGetJobByFileId.throws(new Error('Something went wrong'));

        // Act
        fileService.deleteSuppressionRecords(fileId, isSharedFile)
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
      it('Should throw error when deleteSuppressionJobErrors fails while deleting a file', function (done) {
        //Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceGetJobByFileId.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "contactSuppression",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Queued",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileServiceDeleteSuppressionJobErrors.throws(new Error('Something went wrong'));
        fileServiceContactSuppression.returns('deleted successfully');

        // Act
        fileService.deleteSuppressionRecords(fileId, isSharedFile)
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
      it('Should throw error when contactSuppressionDestroy fails while deleting a file', function (done) {
        //Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceGetJobByFileId.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "contactSuppression",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Queued",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileServiceDeleteSuppressionJobErrors.returns('deleted successfully');
        fileServiceContactSuppression.throws(new Error('Something went wrong'));

        // Act
        fileService.deleteSuppressionRecords(fileId, isSharedFile)
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
      it('Should throw error when accountSuppressionDestroy fails while deleting a file', function (done) {
        //Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceGetJobByFileId.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "accountSuppression",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Queued",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileServiceDeleteSuppressionJobErrors.returns('deleted successfully');
        fileServiceAccountSuppression.throws(new Error('Something went wrong'));

        // Act
        fileService.deleteSuppressionRecords(fileId, isSharedFile)
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
      it('Should return error if Job status is processing', function (done) {
        // Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceGetJobByFileId.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "contactSuppression",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Processing",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileServiceDeleteSuppressionJobErrors.returns('deleted successfully');
        fileServiceContactSuppression.returns('deleted successfully');

        fileService.deleteSuppressionRecords(fileId, isSharedFile)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualErrMsg = err.message;
            const expectedErrMsg = `File is Being Currently under Processing`;
  
            expect(actualErrMsg).to.equal(expectedErrMsg);
  
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it('Should return error if Job Operation name is not defined', function (done) {
        // Arrange
        const fileId = '01';
        const isSharedFile = true;

        fileServiceGetJobByFileId.returns({
          chunks: "6",
          createdAt: "2019-07-17T03:24:00.000Z",
          fileId: "01",
          fileName: "Suppressed Accounts",
          jobId: "01",
          operation_name: "Inclusion",
          result_errored: "0",
          result_imported: "600",
          result_processed: "600",
          row_count: "600",
          status: "Completed",
          updatedAt: "2019-07-17T03:24:00.000Z",
        });

        fileServiceDeleteSuppressionJobErrors.returns('deleted successfully');
        fileServiceContactSuppression.returns('deleted successfully');

        fileService.deleteSuppressionRecords(fileId, isSharedFile)
        .then(function () {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `delete for operation Inclusion Not implemented`;

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

describe('#fileService - deleteFileById', function () {
  beforeEach(function () {
    fileServiceGetFileById = sinon.stub(fileService, 'getFileById');
    fileServiceDeleteFile = sinon.stub(fileService, 'deleteFile');
    fileServiceDeleteSuppressionRecords = sinon.stub(fileService, 'deleteSuppressionRecords');
    fileServiceDeleteSuppressionFileJob = sinon.stub(fileService, 'deleteSuppressionFileJob');
    fileServiceDeleteSuppressionFileChunks = sinon.stub(fileService, 'deleteSuppressionFileChunks');
    fileMethodsStub = {
      exists: sinon.stub(),
      delete: sinon.stub(),
    };
    fileStub = sinon.stub().callsFake(() => {
      return fileMethodsStub
    });
    bucketStub = sinon.stub(Storage.prototype, "bucket").callsFake(() => {
      return {
        file: fileStub
      }
    });
  });
  afterEach(function () {
    fileServiceGetFileById.restore();
    fileServiceDeleteFile.restore();
    fileServiceDeleteSuppressionRecords.restore();
    fileServiceDeleteSuppressionFileJob.restore();
    fileServiceDeleteSuppressionFileChunks.restore();
    fileMethodsStub.exists = sinon.stub();
    fileMethodsStub.delete = sinon.stub();
    bucketStub.restore();
  });
  describe('Deleting a File from DB table using File ID', function(){
    context('Check if errors are caught while deleting data from DB', function(){
      const inputs = {
        fileId: '01',
        userId: '02'
      };
      it('Should throw error when getFileById fails while deleting a file', function (done) {
        //Arrange
        fileServiceGetFileById.throws(new Error('Something went wrong'));

        // Act
        fileService.deleteFileById(inputs)
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
      it('Should throw error when file if not get from DB', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          userId: '02'
        };
        fileServiceGetFileById.returns(null);

        // Act
        fileService.deleteFileById(inputs)
        .then(function (result) {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `File With Id 01 Does not Exist`;

          expect(actualErrMsg).to.equal(expectedErrMsg);
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
      it('Should throw error when Storage Bucket File Exists method fails while deleting a file', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          userId: '02'
        };

        fileServiceGetFileById.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Inclusion",
        });
        fileMethodsStub.exists.throws(new Error('Something went wrong'));

        // Act
        fileService.deleteFileById(inputs)
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
      it('Should throw error when Storage Bucket File Delete method fails while deleting a file', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          userId: '02'
        };
        fileServiceGetFileById.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Inclusion",
        });
        fileMethodsStub.exists.returns([true]);
        fileMethodsStub.delete.throws(new Error('Something went wrong'));

        // Act
        fileService.deleteFileById(inputs)
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
      it('Should return error if File Type is not defined', (done) => {
        // Arrange
        const inputs = {
          fileId: '01',
          userId: '02'
        };
        fileServiceGetFileById.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Inclusion",
        });
        fileMethodsStub.exists.returns([false]);
        fileService.deleteFileById(inputs)
        .then(function () {
          const error = new Error('This function could not throw expected error');
          done(error);
        })
        .catch(function (err) {
          // Assert
          const actualErrMsg = err.message;
          const expectedErrMsg = `Unknown File Type Inclusion`;

          expect(actualErrMsg).to.equal(expectedErrMsg);

          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
    context('Check if File is deleted from DB', function(){
      it('Should delete File data from DB when type is "SUPPORTING_DOCUMENT"', function (done) {
        const inputs = {
          fileId: '01',
          userId: '02'
        };
        const isSharedFile = false;
        let expectedFileServiceDeleteFileInput = [inputs.fileId, isSharedFile];
        fileServiceGetFileById.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Supporting Document",
        });
        fileMethodsStub.exists.returns([false]);
        // Act
        fileService.deleteFileById(inputs)
        .then(function (result) {
          const actualFileServiceDeleteFileInputFirstArgs = fileServiceDeleteFile.getCall(0).args[0];
          const actualFileServiceDeleteFileInputSecondArgs = fileServiceDeleteFile.getCall(0).args[1];

          expect(inspect(actualFileServiceDeleteFileInputFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[0], {
            depth: null
          }), 'Expected value not pass in delete file function');
          expect(Object.keys(actualFileServiceDeleteFileInputFirstArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[0]).length, 'Expected value not pass in delete file function');

          expect(inspect(actualFileServiceDeleteFileInputSecondArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[1], {
            depth: null
          }), 'Expected value not pass in delete file function');
          expect(Object.keys(actualFileServiceDeleteFileInputSecondArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[1]).length, 'Expected value not pass in delete file function');
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
      it('Should delete File data from DB when type is "SUPPRESSION"', function (done) {
        const inputs = {
          fileId: '01',
          userId: '02'
        };
        const isSharedFile = true;
        let expectedFileServiceDeleteFileInput = [inputs.fileId, isSharedFile];

        fileServiceGetFileById.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Suppression",
        });
        fileMethodsStub.exists.returns([false]);
        fileServiceDeleteSuppressionRecords.returns();
        fileServiceDeleteSuppressionFileJob.returns();
        fileServiceDeleteSuppressionFileChunks.returns();
        fileServiceDeleteFile.returns();
        // Act
        fileService.deleteFileById(inputs)
        .then(function (result) {
          const actualFileServiceDeleteSuppressionRecordsFirstArgs = fileServiceDeleteSuppressionRecords.getCall(0).args[0];
          const actualFileServiceDeleteSuppressionRecordsSecondArgs = fileServiceDeleteSuppressionRecords.getCall(0).args[1];

          const actualFileServiceDeleteSuppressionFileJobFirstArgs = fileServiceDeleteSuppressionFileJob.getCall(0).args[0];
          const actualFileServiceDeleteSuppressionFileJobSecondArgs = fileServiceDeleteSuppressionFileJob.getCall(0).args[1];

          const actualFileServiceDeleteSuppressionFileChunksFirstArgs = fileServiceDeleteSuppressionFileChunks.getCall(0).args[0];
          const actualFileServiceDeleteSuppressionFileChunksSecondArgs = fileServiceDeleteSuppressionFileChunks.getCall(0).args[1];

          const actualFileServiceDeleteFileInputFirstArgs = fileServiceDeleteFile.getCall(0).args[0];
          const actualFileServiceDeleteFileInputSecondArgs = fileServiceDeleteFile.getCall(0).args[1];

          expect(inspect(actualFileServiceDeleteSuppressionRecordsFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[0], {
            depth: null
          }), 'Expected value not pass in delete suppression records function');
          expect(Object.keys(actualFileServiceDeleteSuppressionRecordsFirstArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[0]).length, 'Expected value not pass in delete suppression records function');
          expect(inspect(actualFileServiceDeleteSuppressionRecordsSecondArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[1], {
            depth: null
          }), 'Expected value not pass in delete suppression records function');
          expect(Object.keys(actualFileServiceDeleteSuppressionRecordsSecondArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[1]).length, 'Expected value not pass in delete suppression records function');

          expect(inspect(actualFileServiceDeleteSuppressionFileJobFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[0], {
            depth: null
          }), 'Expected value not pass in suppression file job function');
          expect(Object.keys(actualFileServiceDeleteSuppressionFileJobFirstArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[0]).length, 'Expected value not pass in suppression file job function');
          expect(inspect(actualFileServiceDeleteSuppressionFileJobSecondArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[1], {
            depth: null
          }), 'Expected value not pass in suppression file job function');
          expect(Object.keys(actualFileServiceDeleteSuppressionFileJobSecondArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[1]).length, 'Expected value not pass in suppression file job function');

          expect(inspect(actualFileServiceDeleteSuppressionFileChunksFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[0], {
            depth: null
          }), 'Expected value not pass in delete suppression file chunks function');
          expect(Object.keys(actualFileServiceDeleteSuppressionFileChunksFirstArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[0]).length, 'Expected value not pass in delete suppression file chunks function');
          expect(inspect(actualFileServiceDeleteSuppressionFileChunksSecondArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[1], {
            depth: null
          }), 'Expected value not pass in delete suppression file chunks function');
          expect(Object.keys(actualFileServiceDeleteSuppressionFileChunksSecondArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[1]).length, 'Expected value not pass in delete suppression file chunks function');

          expect(inspect(actualFileServiceDeleteFileInputFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[0], {
            depth: null
          }), 'Expected value not pass in delete file function');
          expect(Object.keys(actualFileServiceDeleteFileInputFirstArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[0]).length, 'Expected value not pass in delete file function');
          expect(inspect(actualFileServiceDeleteFileInputSecondArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileServiceDeleteFileInput[1], {
            depth: null
          }), 'Expected value not pass in delete file function');
          expect(Object.keys(actualFileServiceDeleteFileInputSecondArgs).length).to.deep.equal(Object.keys(expectedFileServiceDeleteFileInput[1]).length, 'Expected value not pass in delete file function');

          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
    context('Check if File is deleted from Cloud Storage', function(){
      it('Should delete File data from Cloud Storage', function (done) {
        const inputs = {
          fileId: '01',
          userId: '02'
        };

        const expectBucketExistsValue = [true];
        const expectedFileLocation = "da-files-test";
        fileServiceGetFileById.returns({
          id: "01",
          mapping: {
            name: 'Name',
            zoomInfoName: 'SFDC Company Name',
            address: 'address',
          },
          name: "Suppressed Accounts",
          type: "Supporting Document",
          location: expectedFileLocation,
        });
        fileMethodsStub.exists.returns(expectBucketExistsValue);
        // Act
        fileService.deleteFileById(inputs)
        .then(function (result) {
          const actualBucketFileFirstArgs = fileStub.getCall(0).args[0];
          const actualBucketFileExistsReturnValue = fileMethodsStub.exists.getCall(0).returnValue;

          expect(inspect(actualBucketFileFirstArgs, {
            depth: null
          })).to.deep.equal(inspect(expectedFileLocation, {
            depth: null
          }), 'Expected value not pass in bucket file function');
          expect(Object.keys(actualBucketFileFirstArgs).length).to.deep.equal(Object.keys(expectedFileLocation).length, 'Expected value not pass in bucket file function');

          expect(inspect(actualBucketFileExistsReturnValue, {
            depth: null
          })).to.deep.equal(inspect(expectBucketExistsValue, {
            depth: null
          }), 'Expected value not pass in bucket file function');
          expect(Object.keys(actualBucketFileExistsReturnValue).length).to.deep.equal(Object.keys(expectBucketExistsValue).length, 'Expected value not pass in bucket file function');
          expect(fileMethodsStub.delete.calledOnce).to.equal(true, 'Bucket file function not called');
          done();
        })
        .catch(function (err) {
          done(err);
        });
      });
    });
  });
});

describe("#fileService - deleteAllFilesOfAProject", function () {
  beforeEach(function () {
    filesFindAll = sinon.stub(File, 'findAll');
    deleteStub = sinon.stub().returns('Deleted successfully');
    bucketStub = sinon.stub(Storage.prototype, "bucket").callsFake(() => {
      return { 
        file: sinon.stub().callsFake(() => {
          return {
            delete: deleteStub,
          }
        })
      }
    });
    gcpCloudStorageSupportBucketStub = sinon.stub(process.env, 'GCLOUD_STORAGE_SUPPORT_FILE_BUCKET').value('da-local-files');
    gcpCloudStorageProcessBucketStub = sinon.stub(process.env, 'GCLOUD_STORAGE_PROCESS_FILE_BUCKET').value('da-local-files');
  })
  afterEach(function () {
    filesFindAll.restore();
    bucketStub.restore();
    gcpCloudStorageSupportBucketStub.restore();
    gcpCloudStorageProcessBucketStub.restore();
  })
  describe('Delete all files from GCP of a project', function () {
    context('Delete a project files from GCP', function () {
      it ('Should successfully delete all files of a project from GCP', function(done) {
        const inputs = {};
        inputs.projectId = "01";

        filesFindAll.returns([
          {
            location: 'files/01/Task_Allocation/01.csv',
            type: 'Task Allocation',
            name: 'Task_Allocation',
          },
          {
            location: 'files/01/Supporting_Doc/01.csv',
            type: 'Supporting Document',
            name: 'Supporting_Doc',
          }
        ]);

        fileService.deleteAllFilesOfAProject(inputs)
        .then(function (result) {
          const actualData = result;
          const expectedData = undefined;
          const expectedGetAllFilesArgs = {
            where: {
              ProjectId: inputs.projectId,
            },
          }
          const expectedGetAllFilesArgsLength = [expectedGetAllFilesArgs].length;
          const actualGetFilesArgs = filesFindAll.getCall(0).args[0];
          const actualGetFilesArgsLength = filesFindAll.getCall(0).args.length;
          expect(inspect(actualGetFilesArgs, { depth: null })).to.deep.equal(inspect(expectedGetAllFilesArgs, { depth: null }), 'Expected value not passed in files find all function');
          expect(actualGetFilesArgsLength).to.equal(expectedGetAllFilesArgsLength, 'Expected value not passed in files find all function');
          expect(actualData).to.equal(expectedData);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      });

      it('Should throw error when something internally fails while getting list of files for a project', function(done) {
        const inputs = {};
        inputs.projectId = "01";

        filesFindAll.throws(new Error('Something went wrong'));

        fileService.deleteAllFilesOfAProject(inputs)
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

      it ('Should return undefined when gcp storage operation fails while deleting all files of a project from GCP', function(done) {
        const inputs = {};
        inputs.projectId = "01";

        filesFindAll.returns([
          {
            location: 'files/01/Task_Allocation/01.csv',
            type: 'Task Allocation',
            name: 'Task_Allocation',
          },
          {
            location: 'files/01/Supporting_Doc/01.csv',
            type: 'Supporting Document',
            name: 'Supporting_Doc',
          }
        ]);

        deleteStub = sinon.stub().throws(new Error('Something went wrong'));

        fileService.deleteAllFilesOfAProject(inputs)
        .then(function (result) {
          const actualData = result;
          const expectedData = undefined;
          
          expect(actualData).to.equal(expectedData);
          done();
        })
        .catch(function (err) {
          done(err);
        })
      });
    });
  });
})