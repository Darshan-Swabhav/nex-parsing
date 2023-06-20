const {
  expect
} = require('chai');
const sinon = require('sinon');
const {
  CloudTasksClient
} = require('@google-cloud/tasks');
const proxyquire = require('proxyquire');
const {
  Account,
  File,
  Job,
  Sequelize,
} = require('@nexsalesdev/master-data-model');

const {
  inspect
} = require('util');
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

const filterHandlerInstanceStub = {
  validate: sinon.stub(),
  buildWhereClause: sinon.stub(),
};

const FilterHandlerStub = sinon.stub().returns(filterHandlerInstanceStub);

const sortHandlerInstanceStub = {
  validate: sinon.stub(),
  buildOrderClause: sinon.stub(),
};

const SortHandlerStub = sinon.stub().returns(sortHandlerInstanceStub);

const downloadServiceRepo = {
  accountMasterExporter: sinon.stub(),
};

const AccountServiceModule = proxyquire(
  './../../../../../services/master/accounts/accountsService.js', {
    '../../../config/settings/settings-config': settingsConfig,
    '@nexsalesdev/da-download-service-repository': downloadServiceRepo,
    '@nexsalesdev/master-data-model/lib/services/filterHandler': FilterHandlerStub,
    '@nexsalesdev/master-data-model/lib/services/sortHandler': SortHandlerStub,
  }
);
const accountServiceModule = new AccountServiceModule();
let accountsCountMaxRecords, cloudTasksClientStub, dateStub, accountFileCreate, accountServiceUpdateJobStatus, accountServiceAddFile, accountServiceEnqueue, accountFindAndCountAll;

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
        const maximumRecords = 100;
        const filter = {};

        accountsCountMaxRecords.returns(200);

        // Act
        accountServiceModule.getFileIsLarger(filter, maximumRecords)
          .then(function (result) {
            // Assert
            const actualValue = result;
            const expectedValue = true;
            const where = {};

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

            expect(inspect(actualBuildWhereClauseFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should return "false" when requested payload size is less than maximum records', function (done) {
        //Arrange
        const maximumRecords = 100;
        const filter = {};

        accountsCountMaxRecords.returns(50);

        // Act
        accountServiceModule.getFileIsLarger(filter, maximumRecords)
          .then(function (result) {
            // Assert
            const actualValue = result;
            const expectedValue = false;
            const where = {};

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

            expect(inspect(actualBuildWhereClauseFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails', function (done) {
        //Arrange
        const maximumRecords = 100;
        const filter = {};

        accountsCountMaxRecords.throws(new Error('Something went wrong'));

        // Act
        accountServiceModule.getFileIsLarger(filter, maximumRecords)
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
        filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(accountsCountMaxRecordsWhere);
      });
      it('Should verify if query payload is valid', function (done) {
        //Arrange
        const maximumRecords = 100;
        const filter = {};

        accountsCountMaxRecords.returns(200);

        const where = {};

        // Act
        accountServiceModule.getFileIsLarger(filter, maximumRecords)
          .then(function () {
            // Assert
            const expectedContactsCountMaxRecordsArgs = {
              where: where,
              raw: true,
              subQuery: false,
            };

            const actualAccountsCountMaxRecordsArgs = accountsCountMaxRecords.getCall(0).args[0];
            expect(inspect(actualAccountsCountMaxRecordsArgs.where, {
              depth: null
            })).to.deep.equal(inspect(expectedContactsCountMaxRecordsArgs.where, {
              depth: null
            }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualAccountsCountMaxRecordsArgs.raw, {
              depth: null
            })).to.equal(inspect(expectedContactsCountMaxRecordsArgs.raw, {
              depth: null
            }), 'Expected value not pass in account count for maximum records function');
            expect(inspect(actualAccountsCountMaxRecordsArgs.subQuery, {
              depth: null
            })).to.equal(inspect(expectedContactsCountMaxRecordsArgs.subQuery, {
              depth: null
            }), 'Expected value not pass in account count for maximum records function');
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
        const filter = {};

        accountServiceModule.enqueue(jobId, filter)
          .then(function (result) {
            const actual = result;
            const expected = undefined;

            const payload = {
              jobId,
              filter,
            };

            const task = {
              httpRequest: {
                httpMethod: 'POST',
                url: 'https://dev-da-evt-process-file-download-ymghawfbjq-uc.a.run.app/master',
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
        const filter = {};

        accountServiceModule.enqueue(jobId, filter)
          .then(function (result) {
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
    accountFileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    dateStub.restore();
    accountFileCreate.restore();
  });
  describe('Adds File to DB', function () {
    context('File creation in DB', function () {
      it('Should successfully create a file when all correct params are passed during sync download', function (done) {
        //Arrange
        const fileData = {
          fileId: '01',
          jobId: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
        };

        const isAsyncDownload = false;

        accountFileCreate.returns('File Created Successfully');

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `AccountMaster_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: '',
                mapping: {},
                createdBy: fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Processing',
                  chunks: fileData.chunks,
                  operationName: 'syncAccountExport',
                  operationParam: {},
                  processed: 0,
                  imported: 0,
                  errored: 0,
                  createdBy: fileData.createdBy,
                  rowCount: 0,
                  FileId: fileData.fileId,
                },
              },
              includeObject: {
                include: [{
                  model: Job,
                }, ],
              },
            }

            expect(actualMsg).to.equal(expectedMsg);

            const actualFileCreateFirstArgs = accountFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = accountFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = accountFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, {
              depth: null
            }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, {
              depth: null
            }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should successfully create a file when all correct params are passed during async download', function (done) {
        //Arrange
        const fileData = {
          fileId: '01',
          jobId: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
        };

        const fileType = 'Export';
        const fileName = `AccountMaster_${new Date(Date.now())}.csv`;

        const isAsyncDownload = true;

        accountFileCreate.returns('File Created Successfully');

        // Act
        accountServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: fileName,
                type: 'Export',
                format: '.csv',
                location: `files/master/${fileType}/${fileName}`,
                mapping: {},
                createdBy: fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Queued',
                  chunks: fileData.chunks,
                  operationName: 'asyncAccountExport',
                  operationParam: {},
                  processed: 0,
                  imported: 0,
                  errored: 0,
                  createdBy: fileData.createdBy,
                  rowCount: 0,
                  FileId: fileData.fileId,
                },
              },
              includeObject: {
                include: [{
                  model: Job,
                }, ],
              },
            }

            expect(actualMsg).to.equal(expectedMsg);

            const actualFileCreateFirstArgs = accountFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = accountFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = accountFileCreate.getCall(0).args.length;

            expect(inspect(actualFileCreateFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectFileCreateArgs.modelObj, {
              depth: null
            }), 'Expected value not pass in file create function');
            expect(inspect(actualFileCreateSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectFileCreateArgs.includeObject, {
              depth: null
            }), 'Expected value not pass in file create function');
            expect(actualFileCreateArgsLength).to.equal(Object.keys(expectFileCreateArgs).length, 'Expected value not pass in file create function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should throw error when something internally fails while creating file in DB', function (done) {
        //Arrange
        const fileData = {
          fileId: '01',
          jobId: '01',
          createdBy: 'dev.pmgr1@nexsales.com',
        };

        const isAsyncDownload = true;

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

describe('#accountsService - updateJobStatus', function () {
  beforeEach(function () {
    accountServiceUpdateJobStatus = sinon.stub(Job, 'update');
  });
  afterEach(function () {
    accountServiceUpdateJobStatus.restore();
  });
  describe('Update job status', function () {
    context('Update status based on job result', function () {
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

            expect(inspect(actualUpdatedJobStatusFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.jobObj, {
              depth: null
            }), 'Expected value not pass in job update function');
            expect(inspect(actualUpdatedJobStatusSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedUpdatedJobStatusArgs.whereObj, {
              depth: null
            }), 'Expected value not pass in job update function');
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
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountMasterExporter.returns('Exported Records Successfully')

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Exported Records Successfully';

            const fileData = {
              fileId: inputs.fileId,
              jobId: inputs.jobId,
              filter,
              createdBy: inputs.userEmail,
              updatedBy: inputs.userEmail,
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload,
            }

            const dbParam = {
              jobId: inputs.jobId,
              filter,
            };

            const expectedAccountExporterArgs = {
              writableStream,
              dbParam,
            };

            const actualAddFileFirstArgs = accountServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = accountServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = accountServiceAddFile.getCall(0).args.length;

            const actualAccountExporterFirstArgs = downloadServiceRepo.accountMasterExporter.getCall(0).args[0];
            const actualAccountExporterSecondArgs = downloadServiceRepo.accountMasterExporter.getCall(0).args[1];
            const actualAccountExporterArgsLength = downloadServiceRepo.accountMasterExporter.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);

            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualAccountExporterFirstArgs).to.deep.equal(expectedAccountExporterArgs.writableStream, 'Expected value not pass in account master exporter function');
            expect(actualAccountExporterSecondArgs).to.deep.equal(expectedAccountExporterArgs.dbParam, 'Expected value not pass in account master exporter function');
            expect(actualAccountExporterArgsLength).to.deep.equal(Object.keys(expectedAccountExporterArgs).length, 'Expected value not pass in account master exporter function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('Should correctly process and enqueue job when async download is enabled', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountMasterExporter.returns('Exported Records Successfully')

        // Act
        accountServiceModule.downloadAllAccount(inputs, filter, writableStream, isAsyncDownload)
          .then(function (result) {
            // Assert
            const actualMessage = result;
            const expectedMessage = 'Download Task Enqueued Successfully';

            const fileData = {
              fileId: inputs.fileId,
              jobId: inputs.jobId,
              filter,
              createdBy: inputs.userEmail,
              updatedBy: inputs.userEmail,
            };

            const expectedAddFileArgs = {
              fileData,
              isAsyncDownload,
            }

            const expectedEnqueueArgs = {
              jobId: fileData.jobId,
              filter,
            };

            const actualAddFileFirstArgs = accountServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = accountServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = accountServiceAddFile.getCall(0).args.length;

            const actualEnqueueFirstArgs = accountServiceEnqueue.getCall(0).args[0];
            const actualEnqueueSecondArgs = accountServiceEnqueue.getCall(0).args[1];
            const actualEnqueueArgsLength = accountServiceEnqueue.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);

            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualEnqueueFirstArgs).to.deep.equal(expectedEnqueueArgs.jobId, 'Expected value not pass in enqueue function');
            expect(actualEnqueueSecondArgs).to.deep.equal(expectedEnqueueArgs.filter, 'Expected value not pass in enqueue function');
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
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        accountServiceAddFile.throws(new Error('Something went wrong'));

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountMasterExporter.returns('Exported Records Successfully');

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
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = true;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.throws(new Error('Something went wrong'));

        downloadServiceRepo.accountMasterExporter.returns('Exported Records Successfully');

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
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        accountServiceAddFile.returns('Added File Successfully');

        accountServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.accountMasterExporter.throws(new Error('Something went wrong'));

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

describe('#accountsService - getAllAccount', function () {
  beforeEach(function () {
    const accountFindAndCountAllWhere = {};
    filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(accountFindAndCountAllWhere);
    sortHandlerInstanceStub.buildOrderClause = sinon.stub().returns([]);
    accountFindAndCountAll = sinon.stub(Account, 'findAndCountAll');
  });
  afterEach(function () {
    filterHandlerInstanceStub.buildWhereClause = sinon.stub();
    sortHandlerInstanceStub.buildOrderClause = sinon.stub();
    accountFindAndCountAll.restore();
  });
  describe('Get accounts list with total count of accounts', function () {
    context('Get accounts and its total counts', function () {
      it('Should return accounts and total count', function (done) {
        const inputs = {
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountFindAndCountAll.returns({
          count: 0,
          rows: []
        });

        accountServiceModule.getAllAccount(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const actualData = result;
            const expectedData = {
              totalCount: 0,
              docs: [],
            };
            const where = {};

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

            expect(inspect(actualBuildWhereClauseFirstArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseSecondArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, {
              depth: null
            }), 'Expected value not pass in build where clause function');
            expect(inspect(actualBuildWhereClauseThirdArgs, {
              depth: null
            })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, {
              depth: null
            }), 'Expected value not pass in build where clause function');
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
      it('Should throw error when something internally fails while finding account with its total count', function (done) {
        //Arrange
        const inputs = {
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountFindAndCountAll.throws(new Error('Something went wrong'));

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

    context('Validate account find and count all data query', function () {
      it('Should verify if query payload is valid', function (done) {
        const inputs = {
          limit: 0,
          offset: 0
        };
        const filter = {};
        const sort = {};

        accountFindAndCountAll.returns({
          count: 0,
          rows: []
        });

        const where = {};

        const order = [
          ['name', 'asc']
        ];

        accountServiceModule.getAllAccount(inputs, filter, sort)
          .then(function (result) {
            // Assert
            const expectedAccountFindAllArgs = {
              attributes: [
                'domain',
                'name',
                'employeeSize',
                'type',
                'industry',
                'updatedAt',
              ],
              where,
              order,
              offset: inputs.offset,
              limit: inputs.limit,
              raw: true,
              subQuery: false,
            };

            const actualAccountFindAllFirstArg = accountFindAndCountAll.getCall(0).args[0];

            expect(inspect(actualAccountFindAllFirstArg.attributes, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.attributes, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.order, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.order, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.where, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.where, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.limit, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.limit, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.offset, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.offset, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.raw, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.raw, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(inspect(actualAccountFindAllFirstArg.subQuery, {
              depth: null
            })).to.deep.equal(inspect(expectedAccountFindAllArgs.subQuery, {
              depth: null
            }), 'Expected value not pass in accounts find and count all function');
            expect(Object.keys(actualAccountFindAllFirstArg).length).to.deep.equal(Object.keys(expectedAccountFindAllArgs).length, 'Expected value not pass in accounts find and count all function');

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});