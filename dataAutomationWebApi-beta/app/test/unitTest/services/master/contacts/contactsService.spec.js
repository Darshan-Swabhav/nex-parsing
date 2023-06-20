const {
  expect
} = require('chai');
const sinon = require('sinon');
const {
  CloudTasksClient
} = require('@google-cloud/tasks');
const proxyquire = require('proxyquire');
const {
  Contact,
  File,
  Job,
  Sequelize,
  sequelize,
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


const downloadServiceRepo = {
  contactMasterExporter: sinon.stub(),
};

const ContactServiceModule = proxyquire(
  './../../../../../services/master/contacts/contactsService.js', {
    '../../../config/settings/settings-config': settingsConfig,
    '@nexsalesdev/da-download-service-repository': downloadServiceRepo,
    '@nexsalesdev/master-data-model/lib/services/filterHandler': FilterHandlerStub,
  }
);
const contactServiceModule = new ContactServiceModule();
let contactsCountMaxRecords, cloudTasksClientStub, dateStub, contactFileCreate, contactServiceUpdateJobStatus, contactServiceAddFile, contactServiceEnqueue, contactFindAndCountAll;

// describe('#contactsService - getFileIsLarger', () => {
//   beforeEach(function () {
//     contactsCountMaxRecords = sinon.stub(Contact, 'count');
//   });
//   afterEach(function () {
//     contactsCountMaxRecords.restore();
//   });
//   describe('Check the size of records for download process selection', () => {
//     context('Check the size of the requested payload with the maximum records downloadable with synchronous process', () => {
//       it('Should return "true" when requested payload size is greater than maximum records', function (done) {
//         //Arrange
//         const maximumRecords = 100;
//         const filter = {};

//         contactsCountMaxRecords.returns(200);

//         // Act
//         contactServiceModule.getFileIsLarger(filter, maximumRecords)
//           .then(function (result) {
//             // Assert
//             const actualValue = result;
//             const expectedValue = true;
//             const where = {};

//             const filterColumnsMapping = {};

//             const expectedBuildWhereClauseArgs = {
//               filterColumnsMapping,
//               filter,
//               where,
//             }

//             expect(actualValue).to.equal(expectedValue);

//             const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
//             const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
//             const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
//             const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

//             expect(inspect(actualBuildWhereClauseFirstArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(inspect(actualBuildWhereClauseSecondArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(inspect(actualBuildWhereClauseThirdArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should return "false" when requested payload size is less than maximum records', function (done) {
//         //Arrange
//         const maximumRecords = 100;
//         const filter = {};

//         contactsCountMaxRecords.returns(50);

//         // Act
//         contactServiceModule.getFileIsLarger(filter, maximumRecords)
//           .then(function (result) {
//             // Assert
//             const actualValue = result;
//             const expectedValue = false;
//             const where = {};

//             const filterColumnsMapping = {};

//             const expectedBuildWhereClauseArgs = {
//               filterColumnsMapping,
//               filter,
//               where,
//             }

//             expect(actualValue).to.equal(expectedValue);

//             const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
//             const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
//             const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
//             const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

//             expect(inspect(actualBuildWhereClauseFirstArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(inspect(actualBuildWhereClauseSecondArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(inspect(actualBuildWhereClauseThirdArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });

//       it('Should throw error when something internally fails', function (done) {
//         //Arrange
//         const maximumRecords = 100;
//         const filter = {};

//         contactsCountMaxRecords.throws(new Error('Something went wrong'));

//         // Act
//         contactServiceModule.getFileIsLarger(filter, maximumRecords)
//           .then(function (result) {
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             // Assert
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });

//     context('Validate contact count data query', () => {
//       before(function () {
//         const contactsCountMaxRecordsWhere = {};
//         filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(contactsCountMaxRecordsWhere);
//       });
//       it('Should verify if query payload is valid', function (done) {
//         //Arrange
//         const maximumRecords = 100;
//         const filter = {};

//         contactsCountMaxRecords.returns(200);

//         const where = {};

//         // Act
//         contactServiceModule.getFileIsLarger(filter, maximumRecords)
//           .then(function () {
//             // Assert
//             const expectedContactsCountMaxRecordsArgs = {
//               where: where,
//               raw: true,
//               subQuery: false,
//             };

//             const actualcontactsCountMaxRecordsArgs = contactsCountMaxRecords.getCall(0).args[0];
//             expect(inspect(actualcontactsCountMaxRecordsArgs.where, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactsCountMaxRecordsArgs.where, {
//               depth: null
//             }), 'Expected value not pass in contact count for maximum records function');
//             expect(inspect(actualcontactsCountMaxRecordsArgs.raw, {
//               depth: null
//             })).to.equal(inspect(expectedContactsCountMaxRecordsArgs.raw, {
//               depth: null
//             }), 'Expected value not pass in contact count for maximum records function');
//             expect(inspect(actualcontactsCountMaxRecordsArgs.subQuery, {
//               depth: null
//             })).to.equal(inspect(expectedContactsCountMaxRecordsArgs.subQuery, {
//               depth: null
//             }), 'Expected value not pass in contact count for maximum records function');
//             expect(Object.keys(actualcontactsCountMaxRecordsArgs).length).to.deep.equal(Object.keys(expectedContactsCountMaxRecordsArgs).length, 'Expected value not pass in contact count for maximum records function');

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//       after(function () {
//         filterHandlerInstanceStub.buildWhereClause = sinon.stub();
//       });
//     });
//   });
// });

describe('#contactsService - enqueue', function () {
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

        contactServiceModule.enqueue(jobId, filter)
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

        contactServiceModule.enqueue(jobId, filter)
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

describe('#contactsService - addFile', function () {
  beforeEach(function () {
    const now = new Date();
    dateStub = sinon.stub(Date, 'now').returns(now);
    contactFileCreate = sinon.stub(File, 'create');
  });
  afterEach(function () {
    dateStub.restore();
    contactFileCreate.restore();
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

        contactFileCreate.returns('File Created Successfully');

        // Act
        contactServiceModule.addFile(fileData, isAsyncDownload)
          .then(function (result) {
            // Assert
            const expectedMsg = 'File Created Successfully';
            const actualMsg = result;

            const expectFileCreateArgs = {
              modelObj: {
                id: fileData.fileId,
                name: `ContactMaster_${new Date(Date.now())}.csv`,
                type: 'Export',
                format: '.csv',
                location: '',
                mapping: {},
                createdBy: fileData.createdBy,
                Job: {
                  id: fileData.jobId,
                  status: 'Processing',
                  chunks: fileData.chunks,
                  operationName: 'syncContactExport',
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

            const actualFileCreateFirstArgs = contactFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = contactFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = contactFileCreate.getCall(0).args.length;

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
        const fileName = `ContactMaster_${new Date(Date.now())}.csv`;

        const isAsyncDownload = true;

        contactFileCreate.returns('File Created Successfully');

        // Act
        contactServiceModule.addFile(fileData, isAsyncDownload)
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
                  operationName: 'asyncContactExport',
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

            const actualFileCreateFirstArgs = contactFileCreate.getCall(0).args[0];
            const actualFileCreateSecondArgs = contactFileCreate.getCall(0).args[1];
            const actualFileCreateArgsLength = contactFileCreate.getCall(0).args.length;

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

        contactFileCreate.throws(new Error('Something went wrong'));

        // Act
        contactServiceModule.addFile(fileData, isAsyncDownload)
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

describe('#contactsService - updateJobStatus', function () {
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

        contactServiceModule.updateJobStatus(jobId, status)
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

            const actualUpdatedJobStatusFirstArgs = contactServiceUpdateJobStatus.getCall(0).args[0];
            const actualUpdatedJobStatusSecondArgs = contactServiceUpdateJobStatus.getCall(0).args[1];
            const actualUpdatedJobStatusArgsLength = contactServiceUpdateJobStatus.getCall(0).args.length;

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

        contactServiceUpdateJobStatus.throws(new Error('Something went wrong'));

        // Act
        contactServiceModule.updateJobStatus(jobId, status)
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

describe('#contactsService - downloadAllContact', function () {
  beforeEach(function () {
    contactServiceAddFile = sinon.stub(contactServiceModule, 'addFile');
    contactServiceEnqueue = sinon.stub(contactServiceModule, 'enqueue');
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
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactMasterExporter.returns('Exported Records Successfully')

        // Act
        contactServiceModule.downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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

            const expectedContactExporterArgs = {
              writableStream,
              dbParam,
            };

            const actualAddFileFirstArgs = contactServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = contactServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = contactServiceAddFile.getCall(0).args.length;

            const actualContactExporterFirstArgs = downloadServiceRepo.contactMasterExporter.getCall(0).args[0];
            const actualContactExporterSecondArgs = downloadServiceRepo.contactMasterExporter.getCall(0).args[1];
            const actualContactExporterArgsLength = downloadServiceRepo.contactMasterExporter.getCall(0).args.length;

            expect(actualMessage).to.equal(expectedMessage);

            expect(actualAddFileFirstArgs).to.deep.equal(expectedAddFileArgs.fileData, 'Expected value not pass in add file function');
            expect(actualAddFileSecondArgs).to.deep.equal(expectedAddFileArgs.isAsyncDownload, 'Expected value not pass in add file function');
            expect(actualAddFileArgsLength).to.deep.equal(Object.keys(expectedAddFileArgs).length, 'Expected value not pass in add file function');

            expect(actualContactExporterFirstArgs).to.deep.equal(expectedContactExporterArgs.writableStream, 'Expected value not pass in contact master exporter function');
            expect(actualContactExporterSecondArgs).to.deep.equal(expectedContactExporterArgs.dbParam, 'Expected value not pass in contact master exporter function');
            expect(actualContactExporterArgsLength).to.deep.equal(Object.keys(expectedContactExporterArgs).length, 'Expected value not pass in contact master exporter function');

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

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactMasterExporter.returns('Exported Records Successfully')

        // Act
        contactServiceModule.downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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

            const actualAddFileFirstArgs = contactServiceAddFile.getCall(0).args[0];
            const actualAddFileSecondArgs = contactServiceAddFile.getCall(0).args[1];
            const actualAddFileArgsLength = contactServiceAddFile.getCall(0).args.length;

            const actualEnqueueFirstArgs = contactServiceEnqueue.getCall(0).args[0];
            const actualEnqueueSecondArgs = contactServiceEnqueue.getCall(0).args[1];
            const actualEnqueueArgsLength = contactServiceEnqueue.getCall(0).args.length;

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

        contactServiceAddFile.throws(new Error('Something went wrong'));

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactMasterExporter.returns('Exported Records Successfully');

        // Act
        contactServiceModule.downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.throws(new Error('Something went wrong'));

        downloadServiceRepo.contactMasterExporter.returns('Exported Records Successfully');

        // Act
        contactServiceModule.downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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

      it('Should throw error when something internally fails while contacts exports for sync download', function (done) {
        //Arrange
        const inputs = {
          fileId: '01',
          jobId: '01',
          userEmail: 'dev.pmgr1@nexsales.com',
        };

        const writableStream = {};
        const isAsyncDownload = false;

        const filter = {};

        contactServiceAddFile.returns('Added File Successfully');

        contactServiceEnqueue.returns('Download Task Enqueued Successfully');

        downloadServiceRepo.contactMasterExporter.throws(new Error('Something went wrong'));

        // Act
        contactServiceModule.downloadAllContact(inputs, filter, writableStream, isAsyncDownload)
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

// describe('#contactsService - getAllContact', function () {
//   beforeEach(function () {
//     const contactFindAndCountAllWhere = {};
//     filterHandlerInstanceStub.buildWhereClause = sinon.stub().returns(contactFindAndCountAllWhere);
//     contactFindAndCountAll = sinon.stub(Contact, 'findAndCountAll');
//   });
//   afterEach(function () {
//     filterHandlerInstanceStub.buildWhereClause = sinon.stub();
//     contactFindAndCountAll.restore();
//   });
//   describe('Get contacts list with total count of contacts', function () {
//     context('Get contacts and its total counts', function () {
//       it('Should return contacts and total count', function (done) {
//         const inputs = {
//           limit: 0,
//           offset: 0
//         };
//         const filter = {};
//         const sort = {};

//         contactFindAndCountAll.returns({
//           count: 0,
//           rows: []
//         });

//         contactServiceModule.getAllContact(inputs, filter, sort)
//           .then(function (result) {
//             // Assert
//             const actualData = result;
//             const expectedData = {
//               totalCount: 0,
//               docs: [],
//             };
//             const where = {};

//             const filterColumnsMapping = {};

//             const sortColumnsMapping = {};

//             const customSortColumn = {};

//             const expectedBuildWhereClauseArgs = {
//               filterColumnsMapping,
//               filter,
//               where,
//             }

//             const order = [];

//             const expectedBuildOrderClauseArgs = {
//               sortColumnsMapping,
//               customSortColumn,
//               sort,
//               order,
//             }

//             expect(actualData).to.deep.equal(expectedData);

//             const actualBuildWhereClauseFirstArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[0];
//             const actualBuildWhereClauseSecondArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[1];
//             const actualBuildWhereClauseThirdArgs = filterHandlerInstanceStub.buildWhereClause.getCall(0).args[2];
//             const actualBuildWhereClauseArgsLength = filterHandlerInstanceStub.buildWhereClause.getCall(0).args.length;

//             expect(inspect(actualBuildWhereClauseFirstArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filterColumnsMapping, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(inspect(actualBuildWhereClauseSecondArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.filter, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(inspect(actualBuildWhereClauseThirdArgs, {
//               depth: null
//             })).to.deep.equal(inspect(expectedBuildWhereClauseArgs.where, {
//               depth: null
//             }), 'Expected value not pass in build where clause function');
//             expect(actualBuildWhereClauseArgsLength).to.deep.equal(Object.keys(expectedBuildWhereClauseArgs).length, 'Expected value not pass in build where clause function');

//             // expect(actualBuildOrderClauseFirstArgs).to.deep.equal(expectedBuildOrderClauseArgs.sortColumnsMapping, 'Expected value not pass in build order clause function');
//             // expect(actualBuildOrderClauseSecondArgs).to.deep.equal(expectedBuildOrderClauseArgs.customSortColumn, 'Expected value not pass in build order clause function');
//             // expect(actualBuildOrderClauseThirdArgs).to.deep.equal(expectedBuildOrderClauseArgs.sort, 'Expected value not pass in build order clause function');
//             // expect(actualBuildOrderClauseFourthArgs).to.deep.equal(expectedBuildOrderClauseArgs.order, 'Expected value not pass in build order clause function');
//             // expect(actualBuildOrderClauseArgsLength).to.deep.equal(Object.keys(expectedBuildOrderClauseArgs).length, 'Expected value not pass in build order clause function');

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//       it('Should throw error when something internally fails while finding contact with its total count', function (done) {
//         //Arrange
//         const inputs = {
//           limit: 0,
//           offset: 0
//         };
//         const filter = {};
//         const sort = {};

//         contactFindAndCountAll.throws(new Error('Something went wrong'));

//         // Act
//         contactServiceModule.getAllContact(inputs, filter, sort)
//           .then(function (result) {
//             const error = new Error('This function could not throw expected error');
//             done(error);
//           })
//           .catch(function (err) {
//             // Assert
//             const actualErrMsg = err.message;
//             const expectedErrMsg = `Something went wrong`;

//             expect(actualErrMsg).to.equal(expectedErrMsg);
//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });

//     context('Validate contact find and count all data query', function () {
//       it('Should verify if query payload is valid', function (done) {
//         const inputs = {
//           limit: 0,
//           offset: 0
//         };
//         const filter = {};
//         const sort = {};

//         contactFindAndCountAll.returns({
//           count: 0,
//           rows: []
//         });

//         const where = {};

//         const order = [
//           ['updatedAt', 'desc']
//         ];

//         contactServiceModule.getAllContact(inputs, filter, sort)
//           .then(function (result) {
//             // Assert
//             const expectedContactFindAllArgs = {
//               attributes: [
//                 [ sequelize.literal('"firstName" || \' \' || "lastName"'), 'name' ],
//                 'workEmail',
//                 'jobTitle',
//                 'jobLevel',
//                 'jobDepartment',
//                 'disposition',
//                 'updatedAt',
//                 'locationCountry',
//                 'accountName',
//               ],
//               where,
//               order,
//               offset: inputs.offset,
//               limit: inputs.limit,
//               raw: true,
//               subQuery: false,
//             };

//             const actualContactFindAllFirstArg = contactFindAndCountAll.getCall(0).args[0];
//             console.log(actualContactFindAllFirstArg)
//             expect(inspect(actualContactFindAllFirstArg.attributes, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.attributes, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(inspect(actualContactFindAllFirstArg.order, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.order, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(inspect(actualContactFindAllFirstArg.where, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.where, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(inspect(actualContactFindAllFirstArg.limit, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.limit, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(inspect(actualContactFindAllFirstArg.offset, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.offset, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(inspect(actualContactFindAllFirstArg.raw, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.raw, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(inspect(actualContactFindAllFirstArg.subQuery, {
//               depth: null
//             })).to.deep.equal(inspect(expectedContactFindAllArgs.subQuery, {
//               depth: null
//             }), 'Expected value not pass in contacts find and count all function');
//             expect(Object.keys(actualContactFindAllFirstArg).length).to.deep.equal(Object.keys(expectedContactFindAllArgs).length, 'Expected value not pass in contacts find and count all function');

//             done();
//           })
//           .catch(function (err) {
//             done(err);
//           });
//       });
//     });
//   });
// });